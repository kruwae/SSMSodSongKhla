import { describe, expect, it } from 'vitest'
import UserCheckInPage from './UserCheckInPage'

describe('UserCheckInPage', () => {
  it('exports a page component', () => {
    expect(typeof UserCheckInPage).toBe('function')
  })
})