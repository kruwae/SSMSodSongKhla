export type AuthRole = 'user' | 'admin'

export type AuthUser = {
  id: string
  name: string
  role: AuthRole
}

export type AuthSession = {
  user: AuthUser | null
  isAuthenticated: boolean
}

const STORAGE_KEY = 'ssm-attendance-auth-session'

const fallbackUsers: Record<AuthRole, AuthUser> = {
  user: {
    id: 'demo-user',
    name: 'ผู้ใช้งาน',
    role: 'user',
  },
  admin: {
    id: 'demo-admin',
    name: 'ผู้ดูแลระบบ',
    role: 'admin',
  },
}

function readStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as Partial<AuthUser> | null
    if (!parsed || (parsed.role !== 'user' && parsed.role !== 'admin') || typeof parsed.id !== 'string') {
      return null
    }

    return {
      id: parsed.id,
      name: typeof parsed.name === 'string' ? parsed.name : fallbackUsers[parsed.role].name,
      role: parsed.role,
    }
  } catch {
    return null
  }
}

function persistUser(user: AuthUser | null) {
  if (typeof window === 'undefined') return

  try {
    if (user) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // Ignore storage failures and keep the in-memory session usable.
  }
}

let sessionUser: AuthUser | null = readStoredUser()

export function getAuthSession(): AuthSession {
  return {
    user: sessionUser,
    isAuthenticated: sessionUser !== null,
  }
}

export function getCurrentUser() {
  return sessionUser
}

export function hasRole(role: AuthRole) {
  return sessionUser?.role === role
}

export function isAuthenticated() {
  return sessionUser !== null
}

export function login(role: AuthRole, name?: string) {
  const user = {
    ...fallbackUsers[role],
    name: name?.trim() || fallbackUsers[role].name,
  }

  sessionUser = user
  persistUser(user)

  return user
}

export function logout() {
  sessionUser = null
  persistUser(null)
}

export function restoreAuthSession() {
  sessionUser = readStoredUser()
  return getAuthSession()
}