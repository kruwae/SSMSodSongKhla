import { useSyncExternalStore } from 'react'
import {
  getAuthSession,
  getCurrentUser,
  hasRole,
  isAuthenticated,
  login,
  logout,
  restoreAuthSession,
  type AuthRole,
  type AuthSession,
  type AuthUser,
} from '../services/auth'

const listeners = new Set<() => void>()

function emitChange() {
  for (const listener of listeners) {
    listener()
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useAuth() {
  const session = useSyncExternalStore(subscribe, getAuthSession, getAuthSession)

  return {
    ...session,
    user: session.user,
    currentUser: getCurrentUser(),
    login: (role: AuthRole, name?: string) => {
      const user = login(role, name)
      emitChange()
      return user
    },
    logout: () => {
      logout()
      emitChange()
    },
    hasRole,
    isAuthenticated,
    restoreAuthSession: () => {
      const restored = restoreAuthSession()
      emitChange()
      return restored
    },
  }
}

export type { AuthRole, AuthSession, AuthUser }