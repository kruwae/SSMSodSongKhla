import { describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import { ProtectedRoute } from './App'

describe('ProtectedRoute', () => {
  it('redirects admin users away from non-admin paths', () => {
    render(
      <MemoryRouter initialEntries={['/user']}>
        <Routes>
          <Route element={<ProtectedRoute role="admin" />}>
            <Route path="/user" element={<div>Protected content</div>} />
          </Route>
          <Route path="/admin" element={<div>Admin page</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Admin page')).toBeInTheDocument()
  })
})
