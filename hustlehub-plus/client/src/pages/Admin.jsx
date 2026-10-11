
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

const sections = [
  { key: 'users', title: 'Users', path: routes.adminUsers },
  { key: 'gigs', title: 'Gigs', path: routes.adminGigs },
  { key: 'bookings', title: 'Bookings', path: routes.adminBookings },
  {
    key: 'transactions',
    title: 'Transactions',
    path: routes.adminTransactions
  }
]

export default function Admin() {
  const [active, setActive] = useState('users')
  const [records, setRecords] = useState({
    users: [],
    gigs: [],
    bookings: [],
    transactions: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  async function load() {
    const results = await Promise.allSettled(
      sections.map(section => api.get(section.path))
    )

    const updated = {
      users: [],
      gigs: [],
      bookings: [],
      transactions: []
    }
    const failures = []

    results.forEach((result, index) => {
      const section = sections[index]

      if (result.status === 'fulfilled') {
        updated[section.key] = listOf(
          result.value,
          section.key
        )
      } else {
        failures.push(`${section.title}: ${result.reason.message}`)
      }
    })

    setRecords(updated)
    setError(
      failures.length ? new Error(failures.join(' | ')) : null
    )
  }

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [])

  async function removeGig(gig) {
    if (!window.confirm(`Remove "${gig.title}"?`)) return

    setBusy(true)
    setError(null)

    try {
      await api.delete(`${routes.gigs}/${idOf(gig)}`)
      await load()
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  function renderRow(item) {
    if (active === 'users') {
      return (
        <>
          <td>{item.displayName || item.name || 'User'}</td>
          <td>{item.email}</td>
          <td>{item.role}</td>
          <td>{dateText(item.createdAt)}</td>
        </>
      )
    }

    if (active === 'gigs') {
      return (
        <>
          <td>{item.title}</td>
          <td>{item.category}</td>
          <td><Status value={item.status} /></td>
          <td>
            <button
              className="btn btn-outline btn-sm"
              disabled={busy || item.status === 'removed'}
              onClick={() => removeGig(item)}
            >
              Remove
            </button>
          </td>
        </>
      )
    }

    if (active === 'bookings') {
      return (
        <>
          <td>{idOf(item)}</td>
          <td>{item.tierTitle}</td>
          <td>{money(item.totalCents)}</td>
          <td><Status value={item.status} /></td>
        </>
      )
    }

    return (
      <>
        <td>{idOf(item)}</td>
        <td>{item.type}</td>
        <td>{money(item.amountCents)}</td>
        <td>{dateText(item.createdAt)}</td>
      </>
    )
  }

  const headers = {
    users: ['Name', 'Email', 'Role', 'Joined'],
    gigs: ['Title', 'Category', 'Status', 'Action'],
    bookings: ['Reference', 'Package', 'Amount', 'Status'],
    transactions: ['Reference', 'Type', 'Amount', 'Date']
  }

  return (
    <section>
      <PageHeading
        eyebrow="ADMINISTRATION"
        title="Admin Dashboard"
        subtitle="Manage HustleHub Plus platform records."
      />

      <div className="stats-grid admin-stats">
        {sections.map(section => (
          <button
            type="button"
            className={`stat-card stat-button ${
              active === section.key ? 'stat-active' : ''
            }`}
            key={section.key}
            onClick={() => setActive(section.key)}
          >
            <span>{section.title}</span>
            <strong>
              {records[section.key].length}
            </strong>
          </button>
        ))}
      </div>

      <Alert error={error} />

      {loading ? (
        <Loading />
      ) : records[active].length === 0 ? (
        <Empty title="No records">
          There are no records to show in this section.
        </Empty>
      ) : (
        <div className="content-card">
          <h2>
            {sections.find(s => s.key === active)?.title}
          </h2>

          <div className="admin-table-wrap">
            <table>
              <thead>
                <tr>
                  {headers[active].map(header => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {records[active].map((item, index) => (
                  <tr key={idOf(item) || index}>
                    {renderRow(item)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}
