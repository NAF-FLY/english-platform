import { spawnSync } from 'node:child_process'

const runner = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'
const checks = [
  ['lint', ['run', 'lint']],
  ['typecheck', ['run', 'typecheck']],
  ['build', ['run', 'build']],
]

for (const [label, args] of checks) {
  console.log(`\n[verify] running ${label}`)

  const result = spawnSync(runner, args, {
    shell: false,
    stdio: 'inherit',
  })

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

console.log('\n[verify] all checks passed')
