import { describe, expect, it, vi } from 'vitest'

const createRequest = (method = 'POST') =>
  new Request('https://example.test/api/admin/google-sheet-test', { method })

describe('api/admin/google-sheet-test', () => {
  it('rejects non-POST requests with a JSON 405 response', async () => {
    const { default: handler } = await import('../../api/admin/google-sheet-test')

    const response = await handler(
      new Request('https://example.test/api/admin/google-sheet-test', { method: 'GET' }),
    )

    expect(response.status).toBe(405)
    expect(response.headers.get('Content-Type')).toContain('application/json')
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: 'Method not allowed',
    })
  })

  it('returns diagnostics that report missing Google Sheets env vars', async () => {
    const originalEnv = process.env
    process.env = {}

    try {
      vi.resetModules()
      const { default: handler } = await import('../../api/admin/google-sheet-test')

      const response = await handler(createRequest())
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.ok).toBe(true)
      expect(body.sheetExists).toBeUndefined()
      expect(Array.isArray(body.steps)).toBe(true)
      expect(body.steps[0]).toMatchObject({
        name: 'env_check',
        ok: false,
        message: 'Google Sheets environment variables are not configured',
      })
    } finally {
      process.env = originalEnv
      vi.resetModules()
    }
  })
})
