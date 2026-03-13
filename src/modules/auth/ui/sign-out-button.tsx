type SignOutButtonProps = {
  action: () => Promise<void>
  label?: string
  variant?: 'ghost' | 'primary' | 'secondary'
}

export function SignOutButton({
  action,
  label = 'Выйти',
  variant = 'secondary',
}: SignOutButtonProps) {
  return (
    <form action={action}>
      <button className="button-link" data-variant={variant} type="submit">
        {label}
      </button>
    </form>
  )
}
