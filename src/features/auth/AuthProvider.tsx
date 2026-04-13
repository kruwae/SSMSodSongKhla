import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import { supabase } from '../../lib/supabase'
import type { AppSession, AppUser } from '../../types/app'

type AuthContextValue = {
  session: AppSession | null
  user: AppUser | null
  isLoading: boolean
  signIn: (identifier: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

type SupabaseProfileRow = {
  id: string
  email: string | null
  full_name: string | null
  role: string | null
  office_name: string | null
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function mapRole(role: string | null | undefined): AppUser['role'] {
  return role === 'admin' ? 'admin' : 'employee'
}

function mapProfileToUser(profile: SupabaseProfileRow | null, email: string | null): AppUser | null {
  if (!profile) return null

  return {
    id: profile.id,
    email: profile.email ?? email ?? '',
    fullName: profile.full_name ?? profile.email ?? email ?? 'Attendance User',
    role: mapRole(profile.role),
    officeName: profile.office_name ?? 'Head Office',
  }
}

function mapProfileToSession(profile: SupabaseProfileRow | null, email: string | null): AppSession | null {
  if (!profile) return null

  return {
    userId: profile.id,
    email: profile.email ?? email ?? '',
    role: mapRole(profile.role),
    displayName: profile.full_name ?? profile.email ?? email ?? 'Attendance User',
    officeName: profile.office_name ?? 'Head Office',
  }
}

async function loadProfile(userId: string): Promise<SupabaseProfileRow | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id,email,full_name,role,office_name')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return (data as SupabaseProfileRow | null) ?? null
}

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [session, setSession] = useState<AppSession | null>(null)
  const [user, setUser] = useState<AppUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const syncSession = async (): Promise<void> => {
      setIsLoading(true)
      const { data, error } = await supabase.auth.getSession()

      if (!isMounted) return

      if (error) {
        setSession(null)
        setUser(null)
        setIsLoading(false)
        return
      }

      const authSession = data.session
      if (!authSession?.user) {
        setSession(null)
        setUser(null)
        setIsLoading(false)
        return
      }

      const profile = await loadProfile(authSession.user.id).catch(() => null)
      if (!isMounted) return

      const nextSession = mapProfileToSession(profile, authSession.user.email ?? null)
      const nextUser = mapProfileToUser(profile, authSession.user.email ?? null)

      if (nextSession && nextUser) {
        setSession(nextSession)
        setUser(nextUser)
      } else {
        setSession({
          userId: authSession.user.id,
          email: authSession.user.email ?? '',
          role: 'employee',
          displayName: authSession.user.email ?? 'Attendance User',
          officeName: 'Head Office',
        })
        setUser({
          id: authSession.user.id,
          email: authSession.user.email ?? '',
          fullName: authSession.user.email ?? 'Attendance User',
          role: 'employee',
          officeName: 'Head Office',
        })
      }

      setIsLoading(false)
    }

    void syncSession()

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, authSession) => {
      if (!isMounted) return

      if (!authSession?.user) {
        setSession(null)
        setUser(null)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      const profile = await loadProfile(authSession.user.id).catch(() => null)
      if (!isMounted) return

      const nextSession = mapProfileToSession(profile, authSession.user.email ?? null)
      const nextUser = mapProfileToUser(profile, authSession.user.email ?? null)

      if (nextSession && nextUser) {
        setSession(nextSession)
        setUser(nextUser)
      } else {
        setSession({
          userId: authSession.user.id,
          email: authSession.user.email ?? '',
          role: 'employee',
          displayName: authSession.user.email ?? 'Attendance User',
          officeName: 'Head Office',
        })
        setUser({
          id: authSession.user.id,
          email: authSession.user.email ?? '',
          fullName: authSession.user.email ?? 'Attendance User',
          role: 'employee',
          officeName: 'Head Office',
        })
      }

      setIsLoading(false)
    })

    return () => {
      isMounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      isLoading,
      signIn: async (identifier: string, password: string) => {
        setIsLoading(true)
        const { error } = await supabase.auth.signInWithPassword({
          email: identifier,
          password,
        })

        if (error) {
          setIsLoading(false)
          throw error
        }

        const { data } = await supabase.auth.getSession()
        const authSession = data.session
        if (!authSession?.user) {
          setSession(null)
          setUser(null)
          setIsLoading(false)
          return
        }

        const profile = await loadProfile(authSession.user.id).catch(() => null)
        const nextSession = mapProfileToSession(profile, authSession.user.email ?? null)
        const nextUser = mapProfileToUser(profile, authSession.user.email ?? null)

        setSession(
          nextSession ?? {
            userId: authSession.user.id,
            email: authSession.user.email ?? '',
            role: 'employee',
            displayName: authSession.user.email ?? 'Attendance User',
            officeName: 'Head Office',
          },
        )
        setUser(
          nextUser ?? {
            id: authSession.user.id,
            email: authSession.user.email ?? '',
            fullName: authSession.user.email ?? 'Attendance User',
            role: 'employee',
            officeName: 'Head Office',
          },
        )
        setIsLoading(false)
      },
      signOut: async () => {
        setIsLoading(true)
        await supabase.auth.signOut()
        setSession(null)
        setUser(null)
        setIsLoading(false)
      },
    }),
    [isLoading, session, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}