
import { describe, expect, it } from 'vitest'

describe('GigDetails page', () => {
  it('loads and provides a default React component', async () => {
    const module = await import('../pages/GigDetails.jsx')

    expect(module.default).toBeTruthy()
  })
})
