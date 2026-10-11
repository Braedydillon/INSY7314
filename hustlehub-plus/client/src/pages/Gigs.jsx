
import { useEffect, useState } from 'react'
import { api, routes } from '../services/api.js'
import {
  PageHeading,
  Loading,
  Empty,
  Alert,
  GigCard
} from '../components/UI.jsx'
import { listOf } from '../utils/format.js'

export default function Gigs() {
  const [gigs, setGigs] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true

    api.get(routes.gigs)
      .then(data => {
        if (active) {
          setGigs(listOf(data, 'gigs'))
        }
      })
      .catch(err => {
        if (active) {
          setError(err)
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  const categories = [
    ...new Set(
      gigs.map(gig => gig.category).filter(Boolean)
    )
  ]

  const filteredGigs = gigs.filter(gig => {
    const text = [
      gig.title,
      gig.description,
      gig.category
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    const matchesSearch = text.includes(
      search.toLowerCase()
    )

    const matchesCategory =
      !category || gig.category === category

    return matchesSearch && matchesCategory
  })

  return (
    <section>
      <PageHeading
        eyebrow="HUSTLEHUB MARKETPLACE"
        title="Browse Gigs"
        subtitle="Discover services offered by freelancers."
      />

      <div className="filter-bar">
        <div className="filter-input">
          <input
            type="search"
            placeholder="Search for services..."
            value={search}
            onChange={event =>
              setSearch(event.target.value)
            }
          />
        </div>

        <select
          value={category}
          onChange={event =>
            setCategory(event.target.value)
          }
        >
          <option value="">All Categories</option>

          {categories.map(item => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Loading label="Loading gigs..." />
      ) : error ? (
        <Alert error={error} />
      ) : filteredGigs.length === 0 ? (
        <Empty title="No gigs found">
          No services are currently available.
        </Empty>
      ) : (
        <div className="gig-grid">
          {filteredGigs.map(gig => (
            <GigCard
              key={gig._id || gig.id}
              gig={gig}
            />
          ))}
        </div>
      )}
    </section>
  )
}
