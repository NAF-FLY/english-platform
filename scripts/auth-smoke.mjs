import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'

import { createServerClient } from '@supabase/ssr'

import { projectRoot, supabaseRunner } from './supabase-local.mjs'

const seedAccount = {
  displayName: 'Polyglot Learner',
  email: 'learner@english-platform.test',
  password: 'DevOnlyPass123!',
}

export async function verifyAuthMilestone({
  appEnv,
  appUrl,
}) {
  console.log('\n[verify] running auth smoke checks')

  const appRuntime = await ensureAppRuntime({
    appEnv,
    appUrl,
  })

  try {
    await verifyAnonymousProtectedRedirect(appRuntime.appUrl)
    await verifySeededPasswordSignIn({
      appEnv,
      appUrl: appRuntime.appUrl,
    })
    await verifyCallbackLifecycle({
      appEnv,
      appUrl: appRuntime.appUrl,
    })
    console.log('[verify] auth smoke checks passed')
  } finally {
    await appRuntime.dispose()
  }
}

async function verifyAnonymousProtectedRedirect(appUrl) {
  const cookieJar = new CookieJar()
  const response = await request(appUrl, '/cabinet', {
    cookieJar,
  })

  expectRedirect(response, '/sign-in?returnTo=%2Fcabinet', 'anonymous /cabinet redirect')
  console.log('[verify] auth: anonymous cabinet requests redirect to sign-in')
}

async function verifySeededPasswordSignIn({ appEnv, appUrl }) {
  const cookieJar = new CookieJar()
  const supabase = createScriptSupabaseClient({
    appEnv,
    cookieJar,
  })
  const signInResult = await supabase.auth.signInWithPassword({
    email: seedAccount.email,
    password: seedAccount.password,
  })

  if (signInResult.error || !signInResult.data.session) {
    throw new Error(`[verify] seeded sign-in failed: ${signInResult.error?.message ?? 'missing session'}`)
  }

  const cabinetResponse = await request(appUrl, '/cabinet', {
    cookieJar,
  })

  if (cabinetResponse.status !== 200) {
    throw new Error(`[verify] expected authenticated /cabinet access to return 200, received ${cabinetResponse.status}`)
  }

  const cabinetHtml = await cabinetResponse.text()

  assertIncludes(cabinetHtml, seedAccount.displayName, 'cabinet should render the seeded learner name')
  assertIncludes(cabinetHtml, seedAccount.email, 'cabinet should render the seeded learner email')

  const authRouteResponse = await request(appUrl, '/sign-in?returnTo=%2Fsign-up', {
    cookieJar,
  })
  expectRedirect(authRouteResponse, '/cabinet', 'authenticated sign-in route redirect')

  const signOutResult = await supabase.auth.signOut()

  if (signOutResult.error) {
    throw new Error(`[verify] sign-out failed: ${signOutResult.error.message}`)
  }

  const signedOutCabinetResponse = await request(appUrl, '/cabinet', {
    cookieJar,
  })
  expectRedirect(signedOutCabinetResponse, '/sign-in?returnTo=%2Fcabinet', 'post sign-out cabinet redirect')

  console.log('[verify] auth: seeded sign-in, SSR cabinet access, auth-route redirect, and sign-out session teardown are stable')
}

async function verifyCallbackLifecycle({ appEnv, appUrl }) {
  const missingCodeResponse = await request(appUrl, '/callback', {
    cookieJar: new CookieJar(),
  })
  expectRedirect(missingCodeResponse, '/auth-error?reason=missing-code', 'callback missing-code redirect')

  const invalidCodeResponse = await request(appUrl, '/callback?code=invalid-code', {
    cookieJar: new CookieJar(),
  })
  expectRedirect(invalidCodeResponse, '/auth-error?reason=invalid-link', 'callback invalid-code redirect')

  const requestedAt = new Date().toISOString()
  const cookieJar = new CookieJar()
  const supabase = createScriptSupabaseClient({
    appEnv,
    cookieJar,
  })
  const magicLinkResult = await supabase.auth.signInWithOtp({
    email: seedAccount.email,
    options: {
      emailRedirectTo: 'http://127.0.0.1:3000/callback',
    },
  })

  if (magicLinkResult.error) {
    throw new Error(`[verify] callback magic-link initiation failed: ${magicLinkResult.error.message}`)
  }

  const confirmationLink = await waitForMailpitLink({
    createdAfter: requestedAt,
    emailAddress: seedAccount.email,
    subjectIncludes: 'Magic Link',
  })
  const verificationResponse = await fetch(rewriteCallbackLink(confirmationLink, '/callback'), {
    redirect: 'manual',
  })
  const callbackLocation = verificationResponse.headers.get('location')

  if (!callbackLocation) {
    throw new Error('[verify] confirmation link did not redirect back to the app callback route')
  }

  const callbackUrl = new URL(callbackLocation, confirmationLink).toString()
  const callbackResponse = await requestAbsolute(callbackUrl, {
    cookieJar,
  })

  expectRedirect(callbackResponse, '/cabinet', 'callback success redirect')

  const cabinetResponse = await request(appUrl, '/cabinet', {
    cookieJar,
  })

  if (cabinetResponse.status !== 200) {
    throw new Error(`[verify] expected callback-established session to unlock /cabinet, received ${cabinetResponse.status}`)
  }

  const cabinetHtml = await cabinetResponse.text()
  assertIncludes(cabinetHtml, seedAccount.displayName, 'cabinet should render the magic-link learner name')

  const reusedLinkResponse = await requestAbsolute(callbackUrl, {
    cookieJar: new CookieJar(),
  })
  expectRedirect(reusedLinkResponse, '/auth-error?reason=invalid-link', 'reused callback redirect')

  console.log('[verify] auth: callback success, missing-code, and used-link failures behave predictably')
}

async function ensureAppRuntime({ appEnv, appUrl }) {
  const url = new URL(appUrl)
  const existingAppReady = await isExpectedAppReachable(appUrl)

  if (existingAppReady) {
    console.log(`[verify] reusing app runtime at ${appUrl}`)
    return {
      appUrl,
      async dispose() {},
    }
  }

  console.log(`[verify] starting app runtime at ${appUrl}`)

  const child = spawn(
    supabaseRunner,
    ['exec', 'next', 'start', '--hostname', url.hostname, '--port', url.port || '80'],
    {
      cwd: projectRoot,
      env: {
        ...process.env,
        NEXT_PUBLIC_APP_URL: appUrl,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: appEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        NEXT_PUBLIC_SUPABASE_URL: appEnv.NEXT_PUBLIC_SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY: appEnv.SUPABASE_SERVICE_ROLE_KEY,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  )

  let output = ''

  child.stdout.on('data', (chunk) => {
    output += chunk.toString()
  })

  child.stderr.on('data', (chunk) => {
    output += chunk.toString()
  })

  const exitPromise = new Promise((resolve) => {
    child.once('exit', (code) => {
      resolve(code ?? 1)
    })
  })

  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (await isExpectedAppReachable(appUrl)) {
      return {
        appUrl,
        async dispose() {
          child.kill('SIGTERM')
          await Promise.race([
            exitPromise,
            delay(5_000),
          ])
        },
      }
    }

    const exited = await Promise.race([
      exitPromise.then((code) => ({ code, exited: true })),
      delay(500).then(() => ({ exited: false })),
    ])

    if (exited.exited) {
      throw new Error(`[verify] app runtime failed to start on ${appUrl}\n${output.trim()}`)
    }
  }

  child.kill('SIGTERM')
  await Promise.race([
    exitPromise,
    delay(5_000),
  ])

  throw new Error(`[verify] timed out waiting for the app runtime at ${appUrl}\n${output.trim()}`)
}

async function isExpectedAppReachable(appUrl) {
  try {
    const response = await fetch(new URL('/sign-in', appUrl), {
      redirect: 'manual',
    })

    if (response.status !== 200) {
      return false
    }

    const html = await response.text()
    return html.includes('Войти по email') && html.includes('$ACTION_KEY')
  } catch {
    return false
  }
}

async function waitForMailpitLink({ createdAfter, emailAddress, subjectIncludes }) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const messagesResponse = await fetch('http://127.0.0.1:55324/api/v1/messages')

    if (!messagesResponse.ok) {
      throw new Error(`[verify] Mailpit list request failed: ${messagesResponse.status} ${messagesResponse.statusText}`)
    }

    const messageList = await messagesResponse.json()
    const message = messageList.messages.find((candidate) => {
      if (subjectIncludes && !candidate.Subject?.includes(subjectIncludes)) {
        return false
      }

      if (createdAfter && candidate.Created <= createdAfter) {
        return false
      }

      const recipients = candidate.To ?? []
      return recipients.some((recipient) => recipient.Address === emailAddress)
    })

    if (message) {
      const messageResponse = await fetch(`http://127.0.0.1:55324/api/v1/message/${message.ID}`)

      if (!messageResponse.ok) {
        throw new Error(`[verify] Mailpit message request failed: ${messageResponse.status} ${messageResponse.statusText}`)
      }

      const messagePayload = await messageResponse.json()
      const htmlPart = Array.isArray(messagePayload.HTML) ? messagePayload.HTML.join('\n') : messagePayload.HTML ?? ''
      const textPart = Array.isArray(messagePayload.Text) ? messagePayload.Text.join('\n') : messagePayload.Text ?? ''
      const body = `${htmlPart}\n${textPart}`
      const link = body.match(/https?:\/\/[^\s"'<>]+/i)?.[0] ?? null

      if (!link) {
        throw new Error('[verify] confirmation email arrived without a link that could be parsed')
      }

      return decodeMailpitLink(link)
    }

    await delay(1_000)
  }

  throw new Error(`[verify] auth email for ${emailAddress} did not arrive in Mailpit`)
}

function createScriptSupabaseClient({ appEnv, cookieJar }) {
  return createServerClient(
    appEnv.NEXT_PUBLIC_SUPABASE_URL,
    appEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieJar.getAll()
        },
        setAll(cookiesToSet) {
          cookieJar.setAll(cookiesToSet)
        },
      },
    },
  )
}

async function request(appUrl, pathname, { body, cookieJar, headers = {}, method = 'GET' } = {}) {
  return requestAbsolute(new URL(pathname, appUrl), {
    body,
    cookieJar,
    headers,
    method,
  })
}

async function requestAbsolute(url, { body, cookieJar, headers = {}, method = 'GET' } = {}) {
  const response = await fetch(url, {
    body,
    headers: {
      ...headers,
      ...(cookieJar ? cookieJar.toHeaders() : {}),
    },
    method,
    redirect: 'manual',
  })

  if (cookieJar) {
    cookieJar.capture(response)
  }

  return response
}

function expectRedirect(response, expectedLocation, label) {
  const location = response.headers.get('location')

  if (!location) {
    throw new Error(`[verify] ${label} did not return a redirect location`)
  }

  const normalizedLocation = normalizeLocation(location)
  const normalizedExpectedLocation = normalizeLocation(expectedLocation)

  if (normalizedLocation !== normalizedExpectedLocation) {
    throw new Error(`[verify] ${label} redirected to ${location} instead of ${expectedLocation}`)
  }

  if (response.status < 300 || response.status >= 400) {
    throw new Error(`[verify] ${label} expected a 3xx response, received ${response.status}`)
  }
}

function assertIncludes(content, value, message) {
  if (!content.includes(value)) {
    throw new Error(`[verify] ${message}`)
  }
}

function decodeMailpitLink(link) {
  return link
    .replace(/=\r?\n/g, '')
    .replace(/&amp;/g, '&')
}

function rewriteCallbackLink(link, callbackPath) {
  const rewritten = new URL(link)
  rewritten.searchParams.set('redirect_to', `http://127.0.0.1:3000${callbackPath}`)
  return rewritten.toString()
}

function normalizeLocation(location) {
  try {
    const url = new URL(location)
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return location
  }
}

class CookieJar {
  constructor() {
    this.cookies = new Map()
  }

  capture(response) {
    const setCookies = typeof response.headers.getSetCookie === 'function'
      ? response.headers.getSetCookie()
      : splitSetCookieHeader(response.headers.get('set-cookie'))

    for (const entry of setCookies) {
      const [nameValue] = entry.split(';')
      const separatorIndex = nameValue.indexOf('=')

      if (separatorIndex === -1) {
        continue
      }

      const name = nameValue.slice(0, separatorIndex).trim()
      const value = nameValue.slice(separatorIndex + 1)

      if (!value) {
        this.cookies.delete(name)
        continue
      }

      this.cookies.set(name, value)
    }
  }

  toHeaders() {
    if (this.cookies.size === 0) {
      return {}
    }

    return {
      cookie: [...this.cookies.entries()]
        .map(([name, value]) => `${name}=${value}`)
        .join('; '),
    }
  }

  getAll() {
    return [...this.cookies.entries()].map(([name, value]) => ({
      name,
      value,
    }))
  }

  setAll(cookiesToSet) {
    for (const { name, value } of cookiesToSet) {
      if (!value) {
        this.cookies.delete(name)
        continue
      }

      this.cookies.set(name, value)
    }
  }
}

function splitSetCookieHeader(headerValue) {
  if (!headerValue) {
    return []
  }

  return headerValue.split(/,(?=[^;]+=[^;]+)/g)
}
