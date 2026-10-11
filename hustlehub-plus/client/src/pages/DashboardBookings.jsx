
import { useEffect, useState } from 'react'
import { api, routes } from '../services/api.js'
import {
  PageHeading,
  Loading,
  Empty,
  Alert,
  Status
} from '../components/UI.jsx'
import {
  listOf,
  idOf,
  money,
  dateText
} from '../utils/format.js'

export default function DashboardBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState('')

  async function refresh() {
    const data = await api.get(routes.myBookings)
    setBookings(listOf(data, 'bookings'))
  }

  useEffect(() => {
    let active = true

    api.get(routes.myBookings)
      .then(data => {
        if (active) {
          setBookings(listOf(data, 'bookings'))
        }
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
  }, [])

  async function changeStatus(booking, action) {
    const id = idOf(booking)

    if (busy) return

    setBusy(id)
    setError(null)

    try {
      await api.patch(
        `${routes.bookings}/${id}/${action}`,
        {}
      )

      await refresh()
    } catch (err) {
      setError(err)
    } finally {
      setBusy('')
    }
  }

  return (
    <section>
      <PageHeading
        eyebrow="FREELANCER DASHBOARD"
        title="Booking Requests"
        subtitle="Accept or decline requests from clients."
      />

      <Alert error={error} />

      {loading ? (
        <Loading />
      ) : bookings.length === 0 && !error ? (
        <Empty title="No booking requests">
          Requests from clients will appear here.
        </Empty>
      ) : (
        <div className="stack-list">
          {bookings.map(booking => (
            <div
              className="booking-row"
              key={idOf(booking)}
            >
              <div className="booking-icon">✦</div>

              <div className="booking-main">
                <strong>
                  {booking.gig?.title ||
                    booking.tierTitle ||
                    'Booking Request'}
                </strong>

                <p>{dateText(booking.createdAt)}</p>

                <small>
                  {booking.client?.contactMethod ||
                    booking.clientContactMethod ||
                    ''}
                </small>
              </div>

              <strong>
                {money(booking.totalCents)}
              </strong>

              <Status value={booking.status} />

              {booking.status === 'pending' && (
                <div className="row-actions">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={Boolean(busy)}
                    onClick={() =>
                      changeStatus(booking, 'accept')
                    }
                  >
                    {busy === idOf(booking)
                      ? 'Saving...'
                      : 'Accept'}
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    disabled={Boolean(busy)}
                    onClick={() =>
                      changeStatus(booking, 'decline')
                    }
                  >
                    Decline
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
