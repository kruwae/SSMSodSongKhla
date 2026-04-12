import { describe, expect, it } from 'vitest'
import { Navigate } from 'react-router-dom'
import { ProtectedRoute } from './App'

describe('ProtectedRoute', () => {
  it('redirects admin users away from non-admin paths', () => {
    const element = ProtectedRoute({ role: 'admin' })
    expect(element.type).toBe(Navigate)
    expect(element.props.to).toBe('/admin')
  })
})