
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Gigs from '../pages/Gigs.jsx'
import { api } from '../services/api.js'

vi.mock('../services/api.js', () => ({
  api: {
    get: vi.fn()
  },
  routes: {
    gigs: '/api/gigs'
  }
}))

vi.mock('../components/UI.jsx', () => ({
  PageHeading: ({ title }) => <h1>{title}</h1>,
  Loading: () => <p>Loading gigs...</p>,
  Empty: ({ children }) => <p>{children}</p>,
  Alert: ({ error }) =>
    error ? <p role="alert">{String(error)}</p> : null,
  GigCard: ({ gig }) => <article>{gig.title}</article>
}))

vi.mock('../utils/format.js', () => ({
  listOf: (response, key) => response[key] || []
}))

const sampleGigs = [
  {
    _id: '1',
    title: 'Website Development',
    category: 'Technology',
    description: 'Build a website'
  },
  {
    _id: '2',
    title: 'Logo Design',
    category: 'Design',
    description: 'Make a logo'
  }
]

beforeEach(() => {
  vi.clearAllMocks()

  api.get.mockResolvedValue({
    gigs: sampleGigs
  })
})

describe('Browse Gigs', () => {

  it('renders the Browse Gigs heading', () => {
    render(<Gigs />)

    expect(
      screen.getByRole('heading', {
        name: /browse gigs/i
      })
    ).toBeInTheDocument()
  })

  it('shows gigs returned by the backend API', async () => {
    render(<Gigs />)

    expect(
      await screen.findByText('Website Development')
    ).toBeInTheDocument()

    expect(
      screen.getByText('Logo Design')
    ).toBeInTheDocument()

    expect(api.get).toHaveBeenCalledWith('/api/gigs')
  })

  it('filters gigs when someone types a search', async () => {
    const user = userEvent.setup()

    render(<Gigs />)

    await screen.findByText('Website Development')

    await user.type(
      screen.getByPlaceholderText('Search for services...'),
      'Logo'
    )

    expect(
      screen.getByText('Logo Design')
    ).toBeInTheDocument()

    expect(
      screen.queryByText('Website Development')
    ).not.toBeInTheDocument()
  })
})
