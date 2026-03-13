export { createBrowserSupabaseClient } from './browser'
export { createServerSupabaseClient } from './server'
export {
  checkTableAccess,
  getProfileSnapshot,
  getRoleSnapshots,
  type PlatformRole,
  type ProfileSnapshot,
} from './access'
export type {
  CompositeTypes,
  Database,
  Enums,
  Json,
  Tables,
  TablesInsert,
  TablesUpdate,
} from './types'
