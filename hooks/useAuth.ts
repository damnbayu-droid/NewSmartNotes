'use client'

import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@/types'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })
  const supabase = createClient()
  const router = useRouter()

  const refreshUser = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error

      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, subscription_tier, ads_disabled')
          .eq('id', session.user.id)
          .single()

        setState({
          user: {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata.name || session.user.email?.split('@')[0] || 'User',
            avatar: session.user.user_metadata.avatar,
            created_at: session.user.created_at,
            role: profile?.role || 'user',
            subscription_tier: profile?.subscription_tier || 'free',
            ads_disabled: !!profile?.ads_disabled,
          },
          isAuthenticated: true,
          isLoading: false,
        })
      } else {
        setState({ user: null, isAuthenticated: false, isLoading: false })
      }
    } catch (err) {
      console.error('Auth refresh error:', err)
      setState({ user: null, isAuthenticated: false, isLoading: false })
    }
  }, [supabase])

  useEffect(() => {
    refreshUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        refreshUser()
      } else {
        setState({ user: null, isAuthenticated: false, isLoading: false })
      }
    })

    return () => subscription.unsubscribe()
  }, [refreshUser, supabase])

  const signUp = useCallback(async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
          },
        },
      });

      if (error) return { success: false, error: error.message };
      
      if (data.user && !data.session) {
        return { success: true, error: 'Identity Initiated. Please verify your neural link via email.' };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [supabase]);

  const signIn = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [supabase]);

  const signInWithGoogle = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      // Use window.location.origin to ensure redirects stay on the current environment (localhost vs prod)
      const redirectTo = `${window.location.origin}/auth/callback`
      console.log('Initiating Google Neural Bridge with redirect:', redirectTo)

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [supabase]);

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    toast.success('Neural Link Terminated')
  }

  const resetPassword = useCallback(async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/`,
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [supabase]);

  const updateProfile = useCallback(async (data: { name?: string; avatar?: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.updateUser({ data });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [supabase]);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!state.user?.email) return { success: false, error: 'Identity not established' };
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: state.user.email,
        password: currentPassword,
      });
      if (signInError) return { success: false, error: 'Incorrect current access key' };

      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) return { success: false, error: updateError.message };

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [supabase, state.user]);

  return {
    ...state,
    refreshUser,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateProfile,
    changePassword,
  }
}
