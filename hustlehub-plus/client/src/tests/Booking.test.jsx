
import { describe, expect, it } from 'vitest'

describe('Booking page', () => {
  it('loads and provides a default React component', async () => {
    const module = await import('../pages/Booking.jsx')

    expect(module.default).toBeTruthy()
  })
})
