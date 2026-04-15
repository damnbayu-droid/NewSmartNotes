import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Production Guard: Prevent build-time crashes if environment variables are missing
  if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('Supabase credentials missing during build - skipping client initialization')
    }
    return createBrowserClient('', '')
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
