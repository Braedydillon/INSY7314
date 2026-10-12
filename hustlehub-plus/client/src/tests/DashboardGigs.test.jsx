
import { describe, expect, it } from 'vitest'

describe('DashboardGigs page', () => {
  it('loads and provides a default React component', async () => {
    const module = await import('../pages/DashboardGigs.jsx')

    expect(module.default).toBeTruthy()
  })
})
