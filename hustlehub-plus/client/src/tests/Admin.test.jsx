
import { describe, expect, it } from 'vitest'

describe('Admin page', () => {
  it('loads and provides a default React component', async () => {
    const module = await import('../pages/Admin.jsx')

    expect(module.default).toBeTruthy()
  })
})
