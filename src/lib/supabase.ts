export type SupabaseClientLike = {
  auth: {
    getSession: () => Promise<{ data: { session: null } }>
    getUser: () => Promise<{ data: { user: null } }>
  }
}

export type SupabaseConfig = {
  url: string
  anonKey: string
}

const placeholderSession = { data: { session: null as null } }
const placeholderUser = { data: { user: null as null } }

const placeholderClient: SupabaseClientLike = {
  auth: {
    getSession: async () => placeholderSession,
    getUser: async () => placeholderUser,
  },
}

export function createSupabaseClient(config?: Partial<SupabaseConfig>): SupabaseClientLike {
  void config
  return placeholderClient
}

export const supabase = createSupabaseClient()