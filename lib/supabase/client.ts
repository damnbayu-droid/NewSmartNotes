import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Production Guard: Prevent crashes if secrets are missing at build or runtime
  const isMissing = !supabaseUrl || !supabaseAnonKey

  if (isMissing) {
    return createBrowserClient(
      'https://hardened-placeholder.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_key'
    )
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
