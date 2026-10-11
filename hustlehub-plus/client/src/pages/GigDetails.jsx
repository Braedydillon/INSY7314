
import { useEffect, useState } from 'react'
import {
  Link,
  useNavigate,
  useParams
} from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { api, routes } from '../services/api.js'
import {
  PageHeading,
  Loading,
  Alert
} from '../components/UI.jsx'
import {
  money,
  idOf,
  recordOf
} from '../utils/format.js'

export default function GigDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [gig, setGig] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let active = true

    api.get(`${routes.gigs}/${id}`)
      .then(data => {
        if (active) setGig(recordOf(data, 'gig'))
      })
      .catch(err => {
        if (active) setError(err)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [id])

  async function book(tierId) {
    if (!user) {
      navigate('/login')
      return
    }

    if (user.role !== 'client' || busy) return

    setBusy(true)
    setError(null)

    try {
      const response = await api.post(routes.bookings, {
        gigId: id,
        tierId
      })

      const booking = recordOf(response, 'booking')

      navigate(`/bookings/${idOf(booking)}`, {
        state: { booking }
      })
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <Loading />

  if (!gig) {
    return (
      <div>
        <Alert error={error || new Error('Gig not found')} />
        <Link to="/gigs">Back to Gigs</Link>
      </div>
    )
  }

  const freelancer =
    gig.freelancerId &&
    typeof gig.freelancerId === 'object'
      ? gig.freelancerId
      : gig.freelancer || {}

  return (
    <div>
      <Link className="back-link" to="/gigs">
        ← Back to Gigs
      </Link>

      <div className="details-grid">
        <section>
          <PageHeading
            eyebrow={gig.category}
            title={gig.title}
          />

          <div className="content-card">
            <h2>Description</h2>
            <p className="description-preline">
              {gig.description}
            </p>

            <h3>Freelancer</h3>
            <p>
              {freelancer.displayName ||
                gig.freelancerDisplayName ||
                'HustleHub Freelancer'}
            </p>

            {freelancer.contactMethod && (
              <p>
                Contact: {freelancer.contactMethod}
              </p>
            )}
          </div>
        </section>

        <section className="tiers-panel">
          <h2>Choose a Package</h2>
          <Alert error={error} />

          {(gig.tiers || []).map(tier => (
            <div
              className="tier-card"
              key={idOf(tier)}
            >
              <h3>{tier.title}</h3>

              <p>{tier.description}</p>

              <strong className="tier-price">
                {money(tier.priceCents)}
              </strong>

              <button
                className="btn btn-primary btn-block"
                disabled={busy || (user && user.role !== 'client')}
                onClick={() => book(idOf(tier))}
              >
                {busy ? 'Booking...' : 'Book Package'}
              </button>
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}
