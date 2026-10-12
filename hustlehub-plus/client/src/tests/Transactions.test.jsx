
import { describe, expect, it } from 'vitest'

describe('Transactions page', () => {
  it('loads and provides a default React component', async () => {
    const module = await import('../pages/Transactions.jsx')

    expect(module.default).toBeTruthy()
  })
})
