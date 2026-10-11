
export function money(cents) {
  const amount = Number(cents)

  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number.isFinite(amount) ? amount / 100 : 0)
}

export function dateText(value) {
  if (!value) return '—'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

export function idOf(value) {
  if (!value) return ''
  if (typeof value === 'string') return value

  return String(value._id || value.id || '')
}

export function listOf(data, key) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.[key])) return data[key]
  if (Array.isArray(data?.items)) return data.items

  return []
}

export function recordOf(data, key) {
  return data?.[key] || data
}

export function minTierPrice(gig) {
  const prices = (gig?.tiers || [])
    .map(tier => Number(tier.priceCents))
    .filter(Number.isFinite)

  return prices.length ? Math.min(...prices) : null
}

export function homeForRole(role) {
  if (role === 'admin') return '/admin'
  if (role === 'freelancer') return '/dashboard/gigs'
  if (role === 'client') return '/bookings'

  return '/'
}
