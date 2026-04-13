export type AppRole = 'admin' | 'employee'

export type NavigationItem = {
  label: string
  href: string
  icon?: string
}

export type AppSession = {
  userId: string
  email: string
  role: AppRole
  displayName: string
  officeName?: string | null
}

export type AppUser = {
  id: string
  email: string
  fullName: string
  role: AppRole
  officeName?: string | null
}