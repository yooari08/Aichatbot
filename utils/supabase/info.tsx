/**
 * Supabase project reference (Figma Make legacy path).
 * Prefer `src/app/lib/supabase/client.ts` and Vite env vars in application code.
 */
export const projectId = 'nsogqommjioswhbzbzfz'

export const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ?? `https://${projectId}.supabase.co`

export const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? ''

/** @deprecated Use VITE_SUPABASE_PUBLISHABLE_KEY — legacy anon JWT if still needed */
export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''
