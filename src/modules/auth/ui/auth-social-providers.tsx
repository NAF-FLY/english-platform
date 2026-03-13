type AuthSocialProvidersProps = {
  disabled?: boolean
}

const deferredProviders = [
  'Google',
  'Apple ID',
] as const

export function AuthSocialProviders({
  disabled = false,
}: AuthSocialProvidersProps) {
  return (
    <div className="auth-socials">
      {deferredProviders.map((provider) => (
        <button
          aria-disabled="true"
          className="auth-social-button"
          disabled={disabled}
          key={provider}
          type="button"
        >
          <span>{`Продолжить через ${provider}`}</span>
          <span className="auth-social-button__meta">MVP позже</span>
        </button>
      ))}
    </div>
  )
}
