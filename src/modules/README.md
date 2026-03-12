# Modules

Business capabilities should live under `src/modules/<module-name>/` and keep a
consistent internal structure:

- `application/` for orchestration and use cases
- `infrastructure/` for external adapters such as Supabase access
- `types/` for module-specific contracts
- `ui/` for module-owned presentation

Cross-module dependencies should happen through exported application services,
not by importing another module's infrastructure internals.
