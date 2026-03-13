'use client'

import { useActionState } from 'react'

import {
  createSignUpFormState,
  type SignUpFormState,
} from '@/src/modules/auth/types'

import { AuthFeedback } from './auth-feedback'
import { AuthSubmitButton } from './auth-submit-button'

type SignUpFormProps = {
  action: (
    state: SignUpFormState,
    formData: FormData,
  ) => Promise<SignUpFormState>
  initialReturnTo: string
  notice?: string | null
}

export function SignUpForm({
  action,
  initialReturnTo,
  notice = null,
}: SignUpFormProps) {
  const [state, formAction, isPending] = useActionState(
    action,
    createSignUpFormState({ returnTo: initialReturnTo }),
  )

  const currentState = state ?? createSignUpFormState({ returnTo: initialReturnTo })
  const submitLabel = currentState.status === 'success'
    ? 'Отправить письмо повторно'
    : 'Создать аккаунт'

  return (
    <div className="stack-md">
      {notice ? <AuthFeedback>{notice}</AuthFeedback> : null}
      {currentState.message ? (
        <AuthFeedback tone={currentState.status === 'error' ? 'error' : 'success'}>
          {currentState.message}
        </AuthFeedback>
      ) : null}

      <form action={formAction} className="auth-form">
        <input name="returnTo" type="hidden" value={currentState.fields.returnTo ?? initialReturnTo} />

        <div className="auth-field">
          <label htmlFor="sign-up-name">Как к вам обращаться</label>
          <input
            aria-invalid={Boolean(currentState.errors.displayName)}
            autoComplete="name"
            defaultValue={currentState.fields.displayName ?? ''}
            disabled={isPending}
            id="sign-up-name"
            name="displayName"
            placeholder="Анна"
            type="text"
          />
          {currentState.errors.displayName ? (
            <p className="auth-field__error">{currentState.errors.displayName}</p>
          ) : null}
        </div>

        <div className="auth-field">
          <label htmlFor="sign-up-email">Email</label>
          <input
            aria-invalid={Boolean(currentState.errors.email)}
            autoComplete="email"
            defaultValue={currentState.fields.email ?? ''}
            disabled={isPending}
            id="sign-up-email"
            name="email"
            placeholder="student@example.com"
            type="email"
          />
          {currentState.errors.email ? (
            <p className="auth-field__error">{currentState.errors.email}</p>
          ) : null}
        </div>

        <div className="auth-field">
          <label htmlFor="sign-up-password">Пароль</label>
          <input
            aria-invalid={Boolean(currentState.errors.password)}
            autoComplete="new-password"
            defaultValue=""
            disabled={isPending}
            id="sign-up-password"
            name="password"
            placeholder="Минимум 8 символов"
            type="password"
          />
          {currentState.errors.password ? (
            <p className="auth-field__error">{currentState.errors.password}</p>
          ) : null}
        </div>

        <p className="auth-form__hint">
          Профиль и роль ученика создаются автоматически после регистрации через существующий DB-trigger.
        </p>

        <AuthSubmitButton
          idleLabel={submitLabel}
          pendingLabel="Создаем доступ..."
        />
      </form>
    </div>
  )
}
