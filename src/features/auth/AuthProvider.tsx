import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

import type { AppSession, AppUser } from '../../types/app'

type AuthContextValue = {
  session: AppSession | null
  user: AppUser | null
  isLoading: boolean
  signIn: (identifier: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const createMockSession = (identifier: string): AppSession => ({
  userId: 'mock-user-id',
  email: identifier.includes('@') ? identifier : 'employee@attendance.local',
  role: identifier.includes('admin') ? 'admin' : 'employee',
  displayName: 'Attendance User',
  officeName: 'Head Office',
})

const createMockUser = (identifier: string): AppUser => ({
  id: 'mock-user-id',
  email: identifier.includes('@') ? identifier : 'employee@attendance.local',
  fullName: 'Attendance User',
  role: identifier.includes('admin') ? 'admin' : 'employee',
  officeName: 'Head Office',
})

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [session, setSession] = useState<AppSession | null>(null)
  const [user, setUser] = useState<AppUser | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      isLoading,
      signIn: async (identifier: string, _password: string) => {
        setIsLoading(true)
        const nextSession = createMockSession(identifier)
        setSession(nextSession)
        setUser(createMockUser(identifier))
        setIsLoading(false)
      },
      signOut: async () => {
        setSession(null)
        setUser(null)
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