import { getRuntimeConfiguration } from '@/src/lib/env'

const foundationItems = [
  'App Router foundation with modular-monolith boundaries',
  'Centralized environment validation with startup diagnostics',
  'Supabase-ready placeholders without leaking credentials',
] as const

export default function LandingPage() {
  const runtime = getRuntimeConfiguration()

  return (
    <main
      style={{
        display: 'grid',
        minHeight: '100vh',
        padding: '48px 20px',
        placeItems: 'center',
      }}
    >
      <section
        style={{
          width: 'min(860px, 100%)',
          padding: '40px',
          borderRadius: '28px',
          backgroundColor: 'rgba(255, 255, 255, 0.82)',
          boxShadow: '0 24px 80px rgba(27, 37, 48, 0.12)',
          backdropFilter: 'blur(18px)',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: '0.8rem',
            fontWeight: 700,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: '#7b5c27',
          }}
        >
          Phase 1 bootstrap
        </p>
        <h1
          style={{
            marginBottom: '16px',
            fontSize: 'clamp(2.4rem, 8vw, 4.6rem)',
            lineHeight: 0.94,
          }}
        >
          English Platform
        </h1>
        <p
          style={{
            maxWidth: '56ch',
            marginBottom: '32px',
            fontSize: '1.05rem',
            lineHeight: 1.7,
          }}
        >
          Initial application foundation for the Polyglot 16 learning experience.
          The current scaffold wires environment validation, keeps module
          boundaries explicit, and leaves the auth and cabinet route groups ready
          for the next milestone.
        </p>

        <ul
          style={{
            display: 'grid',
            gap: '12px',
            margin: 0,
            marginBottom: '32px',
            paddingLeft: '20px',
          }}
        >
          {foundationItems.map((item) => (
            <li key={item} style={{ lineHeight: 1.6 }}>
              {item}
            </li>
          ))}
        </ul>

        <dl
          style={{
            display: 'grid',
            gap: '12px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            margin: 0,
          }}
        >
          <div>
            <dt style={{ fontWeight: 700 }}>Environment</dt>
            <dd style={{ margin: '4px 0 0' }}>{runtime.nodeEnv}</dd>
          </div>
          <div>
            <dt style={{ fontWeight: 700 }}>Log level</dt>
            <dd style={{ margin: '4px 0 0' }}>{runtime.logLevel}</dd>
          </div>
          <div>
            <dt style={{ fontWeight: 700 }}>Supabase</dt>
            <dd style={{ margin: '4px 0 0' }}>
              {runtime.supabaseConfigured ? 'configured' : 'placeholder mode'}
            </dd>
          </div>
        </dl>
      </section>
    </main>
  )
}
