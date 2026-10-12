
import { describe, expect, it } from 'vitest'

describe('DashboardIncome page', () => {
  it('loads and provides a default React component', async () => {
    const module = await import('../pages/DashboardIncome.jsx')

    expect(module.default).toBeTruthy()
  })
})
