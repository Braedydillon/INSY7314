
import { describe, expect, it } from 'vitest'

describe('Login page', () => {
  it('loads and provides a default React component', async () => {
    const module = await import('../pages/Login.jsx')

    expect(module.default).toBeTruthy()
  })
})
