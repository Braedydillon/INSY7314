
import { describe, expect, it } from 'vitest'

describe('Home page', () => {
  it('loads and provides a default React component', async () => {
    const module = await import('../pages/Home.jsx')

    expect(module.default).toBeTruthy()
  })
})
