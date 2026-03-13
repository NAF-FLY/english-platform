import type { PlatformRole, ProfileSnapshot } from '@/src/lib/supabase'

export type AuthProfileSnapshot = ProfileSnapshot
export type AuthRole = PlatformRole

export type AuthUserSnapshot = {
  email: string | null
  id: string
  profile: AuthProfileSnapshot | null
  roles: AuthRole[]
}

export type AuthStateResult =
  | {
    status: 'anonymous'
    user: null
  }
  | {
    status: 'authenticated'
    user: AuthUserSnapshot
  }

export type SignInWithPasswordInput = {
  email: string
  password: string
}

export type SignInWithPasswordResult =
  | {
    status: 'email-not-confirmed'
  }
  | {
    status: 'invalid-credentials'
  }
  | {
    status: 'signed-in'
    user: AuthUserSnapshot
  }

export type SignUpWithPasswordInput = {
  displayName: string
  email: string
  password: string
  returnTo?: string | null
}

export type SignUpWithPasswordResult =
  | {
    status: 'confirmation-required'
    email: string
  }
  | {
    status: 'email-already-registered'
  }

export type SignOutResult = {
  status: 'signed-out'
}

export type ExchangeCodeForSessionInput = {
  code: string | null | undefined
}

export type ExchangeCodeForSessionResult =
  | {
    status: 'invalid-link'
  }
  | {
    status: 'missing-code'
  }
  | {
    status: 'signed-in'
    user: AuthUserSnapshot
  }

export type AuthFormStateStatus = 'error' | 'idle' | 'success'

export type AuthFormState<FieldName extends string> = {
  errors: Partial<Record<FieldName, string>>
  fields: Partial<Record<FieldName, string>>
  message: string | null
  status: AuthFormStateStatus
}

export type SignInFormField = 'email' | 'password' | 'returnTo'
export type SignUpFormField = 'displayName' | 'email' | 'password' | 'returnTo'

export type SignInFormState = AuthFormState<SignInFormField>
export type SignUpFormState = AuthFormState<SignUpFormField>

export function createSignInFormState(
  fields: Partial<Record<SignInFormField, string>> = {},
): SignInFormState {
  return {
    errors: {},
    fields,
    message: null,
    status: 'idle',
  }
}

export function createSignUpFormState(
  fields: Partial<Record<SignUpFormField, string>> = {},
): SignUpFormState {
  return {
    errors: {},
    fields,
    message: null,
    status: 'idle',
  }
}
