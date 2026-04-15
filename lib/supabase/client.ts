import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Production Guard: Prevent build-time crashes if environment variables are missing
  // We use valid-formatted placeholders to satisfy @supabase/ssr internal validation
  if (!supabaseUrl || !supabaseAnonKey) {
    return createBrowserClient(
      'https://hardened-placeholder.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_key'
    )
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
