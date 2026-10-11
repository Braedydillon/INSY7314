
const BASE = '/api'

export const routes = {
  register: '/auth/register',
  login: '/auth/login',

  me: '/users/me',

  gigs: '/gigs',
  myGigs: '/gigs/mygigs',

  bookings: '/bookings',
  myBookings: '/bookings/mybookings',

  transactions: '/finance/transactions',
  income: '/finance/income',

  adminUsers: '/admin/users',
  adminGigs: '/admin/gigs',
  adminBookings: '/admin/bookings',
  adminTransactions: '/admin/transactions'
}

export class ApiError extends Error {
  constructor(message, status, fieldErrors = {}) {
    super(message)

    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

function makeError(data, status) {
  const fieldErrors = {}

  if (Array.isArray(data?.errors)) {
    for (const item of data.errors) {
      const field =
        item.field ||
        item.path ||
        item.param

      const message =
        item.message ||
        item.msg ||
        'Invalid value'

      if (field) {
        fieldErrors[field] = message
      }
    }
  }

  let fallback = `Request failed (${status}).`

  if (status === 400) {
    fallback = 'Please check your information.'
  }

  if (status === 401) {
    fallback = 'Invalid credentials or session expired.'
  }

  if (status === 403) {
    fallback = 'You do not have permission.'
  }

  if (status === 404) {
    fallback = 'The requested item was not found.'
  }

  if (status === 409) {
    fallback = 'This action cannot be completed.'
  }

  if (status === 429) {
    fallback = 'Too many requests. Please try again later.'
  }

  if (status >= 500) {
    fallback = 'The server could not complete your request.'
  }

  const message =
    data?.error ||
    data?.message ||
    Object.values(fieldErrors)[0] ||
    fallback

  return new ApiError(
    String(message),
    status,
    fieldErrors
  )
}

export async function request(path, options = {}) {
  const {
    body,
    headers: extraHeaders,
    ...fetchOptions
  } = options

  const headers = new Headers(extraHeaders || {})

  const token = sessionStorage.getItem('hh_token')

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  if (
    body !== undefined &&
    !(body instanceof FormData)
  ) {
    headers.set('Content-Type', 'application/json')
  }

  let response

  try {
    response = await fetch(`${BASE}${path}`, {
      ...fetchOptions,
      headers,
      body:
        body === undefined
          ? undefined
          : body instanceof FormData
            ? body
            : JSON.stringify(body)
    })
  } catch {
    throw new ApiError(
      'Cannot connect to the API. Make sure the backend is running.',
      0
    )
  }

  if (response.status === 401 && token) {
    sessionStorage.removeItem('hh_token')
    sessionStorage.removeItem('hh_user')

    window.dispatchEvent(
      new Event('hh:unauthorized')
    )
  }

  if (response.status === 204) {
    return null
  }

  const contentType =
    response.headers.get('content-type') || ''

  let data = null

  if (contentType.includes('application/json')) {
    data = await response.json().catch(() => null)
  }

  if (!response.ok) {
    throw makeError(data, response.status)
  }

  return data
}

export const api = {
  get(path) {
    return request(path, {
      method: 'GET'
    })
  },

  post(path, body) {
    return request(path, {
      method: 'POST',
      body
    })
  },

  put(path, body) {
    return request(path, {
      method: 'PUT',
      body
    })
  },

  patch(path, body) {
    return request(path, {
      method: 'PATCH',
      body
    })
  },

  delete(path) {
    return request(path, {
      method: 'DELETE'
    })
  }
}
