'use client'

import { useActionState } from 'react'

import {
  createSignInFormState,
  type SignInFormState,
} from '@/src/modules/auth/types'

import { AuthFeedback } from './auth-feedback'
import { AuthSocialProviders } from './auth-social-providers'
import { AuthSubmitButton } from './auth-submit-button'

type SignInFormProps = {
  action: (
    state: SignInFormState,
    formData: FormData,
  ) => Promise<SignInFormState>
  initialReturnTo: string
  notice?: string | null
}

export function SignInForm({
  action,
  initialReturnTo,
  notice = null,
}: SignInFormProps) {
  const [state, formAction, isPending] = useActionState(
    action,
    createSignInFormState({ returnTo: initialReturnTo }),
  )

  const currentState = state ?? createSignInFormState({ returnTo: initialReturnTo })

  return (
    <div className="stack-md">
      <AuthSocialProviders disabled={isPending} />

      <div className="auth-divider">
        <span>или войти через email</span>
      </div>

      {notice ? <AuthFeedback>{notice}</AuthFeedback> : null}
      {currentState.message ? (
        <AuthFeedback tone={currentState.status === 'error' ? 'error' : 'success'}>
          {currentState.message}
        </AuthFeedback>
      ) : null}

      <form action={formAction} className="auth-form">
        <input name="returnTo" type="hidden" value={currentState.fields.returnTo ?? initialReturnTo} />

        <div className="auth-field">
          <label htmlFor="sign-in-email">Email</label>
          <input
            aria-invalid={Boolean(currentState.errors.email)}
            autoComplete="email"
            defaultValue={currentState.fields.email ?? ''}
            disabled={isPending}
            id="sign-in-email"
            name="email"
            placeholder="student@example.com"
            type="email"
          />
          {currentState.errors.email ? (
            <p className="auth-field__error">{currentState.errors.email}</p>
          ) : null}
        </div>

        <div className="auth-field">
          <label htmlFor="sign-in-password">Пароль</label>
          <input
            aria-invalid={Boolean(currentState.errors.password)}
            autoComplete="current-password"
            defaultValue=""
            disabled={isPending}
            id="sign-in-password"
            name="password"
            placeholder="••••••••"
            type="password"
          />
          {currentState.errors.password ? (
            <p className="auth-field__error">{currentState.errors.password}</p>
          ) : null}
        </div>

        <div className="auth-checkbox-row">
          <span>После входа сессия сохранится в безопасных SSR-cookie.</span>
          <span>Сброс пароля добавим отдельной фазой.</span>
        </div>

        <AuthSubmitButton
          idleLabel="Войти по email"
          pendingLabel="Проверяем доступ..."
        />
      </form>
    </div>
  )
}
