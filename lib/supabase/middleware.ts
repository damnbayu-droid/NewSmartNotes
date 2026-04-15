import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Production Guard: Prevent build-time and runtime crashes if environment variables are missing
  const isPlaceholder = !supabaseUrl || !supabaseAnonKey

  const supabase = createServerClient(
    isPlaceholder ? 'https://hardened-placeholder.supabase.co' : supabaseUrl,
    isPlaceholder ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_key' : supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not remove this: core auth refresh logic
  // Added try/catch and placeholder guard to prevent 500 error on missing secrets
  if (!isPlaceholder) {
    try {
      await supabase.auth.getUser()
    } catch (error) {
      console.error('Middleware Auth Error:', error)
    }
  }

  return supabaseResponse
}
