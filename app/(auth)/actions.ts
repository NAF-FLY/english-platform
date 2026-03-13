'use server'

import type { Route } from 'next'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import {
  signInWithPassword,
  signUpWithPassword,
} from '@/src/modules/auth/application'
import {
  createSignInFormState,
  createSignUpFormState,
  type SignInFormField,
  type SignInFormState,
  type SignUpFormField,
  type SignUpFormState,
} from '@/src/modules/auth/types'
import {
  resolveAuthenticatedRouteDestination,
  sanitizeReturnToPath,
} from '@/src/server/guards/auth-route-policy'
import { isAppError } from '@/src/shared/types'

const signInSchema = z.object({
  email: z.email('Укажите корректный email.').trim(),
  password: z.string().trim().min(1, 'Введите пароль.'),
  returnTo: z.string().optional(),
})

const signUpSchema = z.object({
  displayName: z.string().trim().min(2, 'Укажите имя не короче 2 символов.').max(80, 'Имя слишком длинное.'),
  email: z.email('Укажите корректный email.').trim(),
  password: z.string().trim().min(8, 'Пароль должен содержать минимум 8 символов.'),
  returnTo: z.string().optional(),
})

export async function submitSignInAction(
  _previousState: SignInFormState,
  formData: FormData,
): Promise<SignInFormState> {
  const rawValues = {
    email: getFormValue(formData, 'email'),
    password: getFormValue(formData, 'password'),
    returnTo: getFormValue(formData, 'returnTo'),
  }

  const result = signInSchema.safeParse(rawValues)

  if (!result.success) {
    return createSignInErrorState({
      email: rawValues.email,
      returnTo: sanitizeReturnToPath(rawValues.returnTo) ?? '',
    }, result.error.flatten().fieldErrors)
  }

  const safeReturnTo = sanitizeReturnToPath(result.data.returnTo)
  const fields = {
    email: result.data.email,
    returnTo: safeReturnTo ?? '',
  }
  let signInResult: Awaited<ReturnType<typeof signInWithPassword>>

  try {
    signInResult = await signInWithPassword({
      email: result.data.email,
      password: result.data.password,
    })
  } catch (error) {
    return createSignInErrorState(
      fields,
      {},
      getGenericActionErrorMessage(error),
    )
  }

  if (signInResult.status === 'invalid-credentials') {
    return createSignInErrorState(
      fields,
      {},
      'Email или пароль не совпадают. Проверьте данные и попробуйте снова.',
    )
  }

  if (signInResult.status === 'email-not-confirmed') {
    return createSignInErrorState(
      fields,
      {},
      'Подтвердите email по письму от English Platform, затем повторите вход.',
    )
  }

  redirect(asRoute(resolveAuthenticatedRouteDestination(safeReturnTo)))
}

export async function submitSignUpAction(
  _previousState: SignUpFormState,
  formData: FormData,
): Promise<SignUpFormState> {
  const rawValues = {
    displayName: getFormValue(formData, 'displayName'),
    email: getFormValue(formData, 'email'),
    password: getFormValue(formData, 'password'),
    returnTo: getFormValue(formData, 'returnTo'),
  }

  const result = signUpSchema.safeParse(rawValues)

  if (!result.success) {
    return createSignUpErrorState({
      displayName: rawValues.displayName,
      email: rawValues.email,
      returnTo: sanitizeReturnToPath(rawValues.returnTo) ?? '',
    }, result.error.flatten().fieldErrors)
  }

  const safeReturnTo = sanitizeReturnToPath(result.data.returnTo)

  try {
    const signUpResult = await signUpWithPassword({
      displayName: result.data.displayName,
      email: result.data.email,
      password: result.data.password,
      returnTo: safeReturnTo,
    })

    if (signUpResult.status === 'email-already-registered') {
      return createSignUpErrorState(
        {
          displayName: result.data.displayName,
          email: result.data.email,
          returnTo: safeReturnTo ?? '',
        },
        {},
        'Аккаунт с этим email уже существует. Войдите или используйте другой адрес.',
      )
    }

    return {
      ...createSignUpFormState({
        displayName: result.data.displayName,
        email: result.data.email,
        returnTo: safeReturnTo ?? '',
      }),
      message: `Мы отправили письмо для подтверждения на ${signUpResult.email}. После подтверждения вернитесь по ссылке из письма.`,
      status: 'success',
    }
  } catch (error) {
    return createSignUpErrorState(
      {
        displayName: result.data.displayName,
        email: result.data.email,
        returnTo: safeReturnTo ?? '',
      },
      {},
      getGenericActionErrorMessage(error),
    )
  }
}

function createSignInErrorState(
  fields: Partial<Record<SignInFormField, string>>,
  fieldErrors: Partial<Record<SignInFormField, string[] | undefined>>,
  message = 'Проверьте форму и повторите попытку.',
): SignInFormState {
  return {
    ...createSignInFormState(fields),
    errors: mapFieldErrors(fieldErrors),
    message,
    status: 'error',
  }
}

function createSignUpErrorState(
  fields: Partial<Record<SignUpFormField, string>>,
  fieldErrors: Partial<Record<SignUpFormField, string[] | undefined>>,
  message = 'Проверьте форму и повторите попытку.',
): SignUpFormState {
  return {
    ...createSignUpFormState(fields),
    errors: mapFieldErrors(fieldErrors),
    message,
    status: 'error',
  }
}

function mapFieldErrors<FieldName extends string>(
  fieldErrors: Partial<Record<FieldName, string[] | undefined>>,
): Partial<Record<FieldName, string>> {
  return Object.entries(fieldErrors).reduce<Partial<Record<FieldName, string>>>(
    (accumulator, [fieldName, messages]) => {
      if (Array.isArray(messages) && typeof messages[0] === 'string') {
        accumulator[fieldName as FieldName] = messages[0]
      }

      return accumulator
    },
    {},
  )
}

function getFormValue(formData: FormData, key: string): string {
  const value = formData.get(key)

  return typeof value === 'string' ? value : ''
}

function getGenericActionErrorMessage(error: unknown): string {
  if (isAppError(error) && error.code === 'UNEXPECTED') {
    return 'Сессия не обновилась корректно. Повторите попытку через несколько секунд.'
  }

  return 'Не удалось завершить запрос. Попробуйте снова.'
}

function asRoute(pathname: string): Route {
  return pathname as Route
}
