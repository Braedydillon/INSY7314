
import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'

import { api, routes } from '../services/api.js'

import {
  PageHeading,
  Loading,
  Alert,
  Status
} from '../components/UI.jsx'

import {
  idOf,
  recordOf,
  money,
  dateText
} from '../utils/format.js'

export default function Booking() {
  const { id } = useParams()
  const location = useLocation()

  const [booking, setBooking] = useState(
    location.state?.booking || null
  )

  const [loading, setLoading] = useState(
    !location.state?.booking
  )

  const [error, setError] = useState(null)

  useEffect(() => {
    if (booking) return

    let active = true

    api.get(`${routes.bookings}/${id}`)
      .then(data => {
        if (active) {
          setBooking(recordOf(data, 'booking'))
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
  }, [id, booking])

  return (
    <div className="narrow-page">
      <PageHeading
        eyebrow="BOOKING CONFIRMATION"
        title="Booking Details"
        subtitle="Track the status of your booking."
      />

      <Alert error={error} />

      {loading ? (
        <Loading />
      ) : booking ? (
        <div className="content-card">
          <div className="success-check">✓</div>

          <h2>Booking Created</h2>

          <p>
            Your booking has been submitted.
            Payment is simulated for this project.
          </p>

          <div className="reference-box">
            Reference: {idOf(booking) || id}
          </div>

          <div className="data-row">
            <span>Package</span>
            <strong>{booking.tierTitle || 'Package'}</strong>
          </div>

          <div className="data-row">
            <span>Amount</span>
            <strong>{money(booking.totalCents)}</strong>
          </div>

          <div className="data-row">
            <span>Date</span>
            <strong>{dateText(booking.createdAt)}</strong>
          </div>

          <div className="data-row">
            <span>Status</span>
            <Status value={booking.status} />
          </div>

          <Link
            className="btn btn-primary"
            to="/bookings"
          >
            Back to My Bookings
          </Link>
        </div>
      ) : (
        <p>Booking not found.</p>
      )}
    </div>
  )
}
