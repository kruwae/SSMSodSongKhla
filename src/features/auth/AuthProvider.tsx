import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

import type { AppUser, AuthSession } from '../../types/app'

type AuthContextValue = {
  session: AuthSession | null
  user: AppUser | null
  isLoading: boolean
  signIn: (identifier: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const createMockSession = (identifier: string): AuthSession => ({
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  expiresAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
  user: {
    id: 'mock-user-id',
    email: identifier.includes('@') ? identifier : 'employee@attendance.local',
    fullName: 'Attendance User',
    role: identifier.includes('admin') ? 'admin' : 'employee',
  },
})

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isLoading,
      signIn: async (identifier: string) => {
        setIsLoading(true)
        setSession(createMockSession(identifier))
        setIsLoading(false)
      },
      signOut: async () => {
        setSession(null)
      },
    }),
    [isLoading, session],
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