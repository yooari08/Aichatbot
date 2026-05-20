import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

let client: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.local'
    )
  }
  if (!client) {
    client = createClient(supabaseUrl, supabaseKey)
  }
  return client
}

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseKey)
}
