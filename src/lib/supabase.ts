import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

export type SupabaseConfig = {
  url: string
  anonKey: string
}

function getSupabaseConfig(): SupabaseConfig {
  const url = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error('Missing Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required.')
  }

  return {
    url,
    anonKey,
  }
}

const { url, anonKey } = getSupabaseConfig()

export const supabase = createClient<Database>(url, anonKey)

export type SupabaseClient = typeof supabase