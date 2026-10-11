
import { useEffect, useState } from 'react'
import { api, routes } from '../services/api.js'
import {
  PageHeading,
  Loading,
  Empty,
  Alert
} from '../components/UI.jsx'
import {
  listOf,
  money,
  dateText,
  idOf
} from '../utils/format.js'

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true

    api.get(routes.transactions)
      .then(data => {
        if (active) {
          setTransactions(listOf(data, 'transactions'))
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

  return (
    <section>
      <PageHeading
        eyebrow="MY ACCOUNT"
        title="Transactions"
        subtitle="Your payment and refund history."
      />

      <Alert error={error} />

      {loading ? (
        <Loading />
      ) : transactions.length === 0 ? (
        <Empty title="No transactions yet">
          Your transactions will appear here.
        </Empty>
      ) : (
        <div className="stack-list">
          {transactions.map(transaction => (
            <div
              className="booking-row"
              key={idOf(transaction)}
            >
              <div className="booking-icon">
                {transaction.type === 'refund'
                  ? '↶'
                  : '↗'}
              </div>

              <div className="booking-main">
                <strong>{transaction.type}</strong>
                <p>{dateText(transaction.createdAt)}</p>
              </div>

              <strong>
                {money(transaction.amountCents)}
              </strong>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
