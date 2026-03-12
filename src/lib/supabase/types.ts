export type Json = boolean | null | number | string | Json[] | { [key: string]: Json | undefined }

type EmptyRecord = Record<string, never>

export type Database = {
  public: {
    CompositeTypes: EmptyRecord
    Enums: EmptyRecord
    Functions: EmptyRecord
    Tables: EmptyRecord
    Views: EmptyRecord
  }
}

export type SupabaseSchema = keyof Database
