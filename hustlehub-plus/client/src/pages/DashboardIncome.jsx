
import { useEffect, useState } from 'react'
import { api, routes } from '../services/api.js'
import {
  PageHeading,
  Loading,
  Alert
} from '../components/UI.jsx'
import { money } from '../utils/format.js'

export default function DashboardIncome() {
  const [income, setIncome] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true

    api.get(routes.income)
      .then(data => {
        if (active) {
          setIncome(data?.income || data)
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

  if (loading) return <Loading />
  if (error) return <Alert error={error} />

  return (
    <section>
      <PageHeading
        eyebrow="FREELANCER DASHBOARD"
        title="My Income"
        subtitle="Track your earnings from bookings."
      />

      <div className="stats-grid">
        <div className="stat-card">
          <span>Completed Income</span>
          <strong>
            {money(income?.incomeCents ?? 0)}
          </strong>
        </div>

        <div className="stat-card">
          <span>Projected Income</span>
          <strong>
            {money(income?.projectedCents ?? 0)}
          </strong>
        </div>
      </div>

      <div className="content-card">
        <h2>Booking Status Summary</h2>

        {['pending', 'confirmed', 'completed'].map(status => (
          <div className="data-row" key={status}>
            <span>{status}</span>
            <strong>
              {income?.byStatus?.[status]?.count ?? 0}
            </strong>
          </div>
        ))}
      </div>
    </section>
  )
}
