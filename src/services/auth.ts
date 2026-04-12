import { apiClient, type ApiAuthSession } from './api'

export type AuthRole = 'user' | 'admin'

export type AuthUser = {
  id: string
  name: string
  role: AuthRole
  token?: string
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

function normalizeSession(session: ApiAuthSession | null): AuthUser | null {
  if (!session || (session.role !== 'user' && session.role !== 'admin')) return null

  return {
    id: session.userId,
    name: session.displayName,
    role: session.role,
    token: session.token,
  }
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
      token: typeof parsed.token === 'string' ? parsed.token : undefined,
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

export async function login(role: AuthRole, name?: string) {
  const user = normalizeSession(await apiClient.login(role, name ? { username: name } : undefined)) ?? {
    ...fallbackUsers[role],
    name: name?.trim() || fallbackUsers[role].name,
  }

  sessionUser = user
  persistUser(user)

  return user
}

export async function refreshAuthSession() {
  const session = normalizeSession(await apiClient.getSession())
  if (session) {
    sessionUser = session
    persistUser(session)
    return getAuthSession()
  }

  return getAuthSession()
}

export async function logout() {
  sessionUser = null
  persistUser(null)

  await apiClient.logout()
}

export function restoreAuthSession() {
  sessionUser = readStoredUser()
  return getAuthSession()
}