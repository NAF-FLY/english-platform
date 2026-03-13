'use client'

import { useFormStatus } from 'react-dom'

type AuthSubmitButtonProps = {
  idleLabel: string
  pendingLabel: string
}

export function AuthSubmitButton({
  idleLabel,
  pendingLabel,
}: AuthSubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button className="auth-submit-button" disabled={pending} type="submit">
      {pending ? pendingLabel : idleLabel}
    </button>
  )
}
