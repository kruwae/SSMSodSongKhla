import { attendanceRows, type AttendanceRow } from '../data/attendanceRows'
import { type CheckInSnapshot, type RegisteredDevice } from './checkInService'

export type ApiRole = 'user' | 'admin'

export type ApiAuthSession = {
  userId: string
  displayName: string
  role: ApiRole
  token?: string
}

export type ApiResponse<T> = {
  ok: boolean
  status: number
  data: T
}

export type ApiRequestInit = RequestInit & {
  skipJsonParse?: boolean
}

export type ApiClientConfig = {
  baseUrl?: string
  fetchImpl?: typeof fetch
}

export type CheckInSaveResult = {
  saved: boolean
  message: string
  snapshot?: CheckInSnapshot
}

export type AdminCrudEntityName = 'users' | 'devices' | 'locations'

export type AdminCrudListResponse<T> = {
  items: T[]
}

export type AdminCrudSaveResult<T> = {
  saved: boolean
  item: T
}

export type AdminCrudDeleteResult = {
  deleted: boolean
  id: string
}

const defaultFetchImpl = globalThis.fetch.bind(globalThis)
const defaultBaseUrl =
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL : ''

function joinUrl(baseUrl: string | undefined, path: string) {
  if (!baseUrl) return path
  return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}

async function requestJson<T>(
  url: string,
  init: ApiRequestInit = {},
  fetchImpl: typeof fetch = defaultFetchImpl,
): Promise<ApiResponse<T>> {
  const response = await fetchImpl(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    ...init,
  })

  if (init.skipJsonParse) {
    return {
      ok: response.ok,
      status: response.status,
      data: undefined as T,
    }
  }

  const contentType = response.headers.get('content-type') ?? ''
  const responseBody = contentType.includes('application/json') ? await response.json() : await response.text()

  if (!response.ok) {
    const errorMessage =
      typeof responseBody === 'object' && responseBody !== null && 'error' in responseBody
        ? String((responseBody as { error: unknown }).error)
        : typeof responseBody === 'object' && responseBody !== null && 'message' in responseBody
          ? String((responseBody as { message: unknown }).message)
          : typeof responseBody === 'string' && responseBody
            ? responseBody
            : `Request failed with status ${response.status}`
    throw new Error(errorMessage)
  }

  const data = responseBody as T
  return {
    ok: true,
    status: response.status,
    data,
  }
}

export function createApiClient(config: ApiClientConfig = {}) {
  const baseUrl = config.baseUrl ?? defaultBaseUrl
  const fetchImpl = config.fetchImpl ?? defaultFetchImpl

  return {
    async getSession() {
      try {
        const response = await requestJson<ApiAuthSession>(joinUrl(baseUrl, '/api/session'), {}, fetchImpl)
        return response.data
      } catch {
        return null
      }
    },

    async login(role: ApiRole, credentials?: { username?: string; password?: string }) {
      try {
        const response = await requestJson<ApiAuthSession>(
          joinUrl(baseUrl, '/api/auth/login'),
          {
            method: 'POST',
            body: JSON.stringify({ role, ...credentials }),
          },
          fetchImpl,
        )
        return response.data
      } catch {
        return null
      }
    },

    async logout() {
      try {
        await requestJson<null>(
          joinUrl(baseUrl, '/api/auth/logout'),
          {
            method: 'POST',
          },
          fetchImpl,
        )
      } catch {
        return undefined
      }
    },

    async listAttendanceRows() {
      try {
        const response = await requestJson<AdminCrudListResponse<AttendanceRow>>(
          joinUrl(baseUrl, '/api/attendance'),
          {},
          fetchImpl,
        )
        return response.data.items
      } catch {
        return attendanceRows
      }
    },

    async saveCheckIn(snapshot: CheckInSnapshot) {
      try {
        const response = await requestJson<CheckInSaveResult>(
          joinUrl(baseUrl, '/api/check-in'),
          {
            method: 'POST',
            body: JSON.stringify(snapshot),
          },
          fetchImpl,
        )
        return response.data
      } catch (error) {
        return {
          saved: false,
          message: error instanceof Error ? error.message : 'backend unavailable',
          snapshot,
        }
      }
    },

    async listAdminEntities<T>(entity: AdminCrudEntityName) {
      try {
        const response = await requestJson<AdminCrudListResponse<T>>(
          joinUrl(baseUrl, `/api/admin/${entity}`),
          {},
          fetchImpl,
        )
        return response.data.items
      } catch {
        return [] as T[]
      }
    },

    async saveAdminEntity<T extends { id: string }>(entity: AdminCrudEntityName, item: T) {
      try {
        const response = await requestJson<AdminCrudSaveResult<T>>(
          joinUrl(baseUrl, `/api/admin/${entity}/${item.id}`),
          {
            method: 'PUT',
            body: JSON.stringify(item),
          },
          fetchImpl,
        )
        return response.data
      } catch {
        return { saved: false, item }
      }
    },

    async deleteAdminEntity(entity: AdminCrudEntityName, id: string) {
      try {
        const response = await requestJson<AdminCrudDeleteResult>(
          joinUrl(baseUrl, `/api/admin/${entity}/${id}`),
          {
            method: 'DELETE',
          },
          fetchImpl,
        )
        return response.data
      } catch {
        return { deleted: false, id }
      }
    },

    async listRegisteredDevices() {
      return this.listAdminEntities<RegisteredDevice>('devices')
    },
  }
}

export const apiClient = createApiClient()
