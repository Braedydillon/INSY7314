
import { describe, expect, it } from 'vitest'

describe('DashboardBookings page', () => {
  it('loads and provides a default React component', async () => {
    const module = await import('../pages/DashboardBookings.jsx')

    expect(module.default).toBeTruthy()
  })
})
