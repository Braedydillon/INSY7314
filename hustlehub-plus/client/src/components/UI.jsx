
import { Link } from 'react-router-dom'
import {
  dateText,
  idOf,
  minTierPrice,
  money
} from '../utils/format.js'

export function PageHeading({
  eyebrow,
  title,
  subtitle,
  actions
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {subtitle && <p className="text-muted">{subtitle}</p>}
      </div>

      {actions && (
        <div className="heading-actions">
          {actions}
        </div>
      )}
    </div>
  )
}

export function Alert({
  error,
  children,
  kind = 'error'
}) {
  const content = error
    ? error.message || String(error)
    : children

  if (!content) return null

  return (
    <div
      role={kind === 'error' ? 'alert' : 'status'}
      className={`alert alert-${kind}`}
    >
      {content}
    </div>
  )
}

export function Loading({ label = 'Loading…' }) {
  return (
    <div className="loading-state" role="status">
      <span className="spinner" />
      {label}
    </div>
  )
}

export function Empty({ title, children }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">✧</span>
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </div>
  )
}

export function Field({
  label,
  name,
  error,
  hint,
  children
}) {
  return (
    <div className="form-field">
      <label htmlFor={name}>{label}</label>

      {children}

      {hint && (
        <small className="field-hint">{hint}</small>
      )}

      {error && (
        <small className="field-error" role="alert">
          {error}
        </small>
      )}
    </div>
  )
}

export function Status({ value }) {
  return (
    <span
      className={`status status-${String(
        value || 'pending'
      ).toLowerCase()}`}
    >
      {value || 'pending'}
    </span>
  )
}

export function GigCard({ gig }) {
  const id = idOf(gig)
  const from = minTierPrice(gig)

  return (
    <article className="gig-card">
      <div className="gig-card-top">
        <span className="category-pill">
          {gig.category || 'Service'}
        </span>

        <span className="muted-small">
          {dateText(gig.createdAt)}
        </span>
      </div>

      <h3>
        <Link to={`/gigs/${id}`}>
          {gig.title}
        </Link>
      </h3>

      <p className="gig-description">
        {gig.description}
      </p>

      <div className="gig-card-bottom">
        <div>
          <span className="muted-small">From</span>
          <strong>
            {from == null
              ? 'Ask for price'
              : money(from)}
          </strong>
        </div>

        <Link
          className="text-link"
          to={`/gigs/${id}`}
        >
          View gig →
        </Link>
      </div>
    </article>
  )
}
