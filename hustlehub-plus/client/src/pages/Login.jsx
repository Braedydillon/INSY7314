
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { api, routes } from '../services/api.js'
import { homeForRole } from '../utils/format.js'
import { Alert, Field } from '../components/UI.jsx'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  async function submit(event) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const data = await api.post(routes.login, {
        email: email.trim().toLowerCase(),
        password
      })

      const token = data.token || data.accessToken
      const user = data.user || {
        id: data.id || data._id,
        email: data.email,
        role: data.role,
        displayName: data.displayName
      }

      login(token, user)

      navigate(
        location.state?.from?.pathname ||
        homeForRole(user.role),
        { replace: true }
      )
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-layout">
      <section className="auth-intro">
        <p className="eyebrow">HUSTLEHUB PLUS</p>
        <h1>Welcome <em>back.</em></h1>
        <p>
          Log in to manage your gigs,
          bookings and account.
        </p>
      </section>

      <section className="form-panel">
        <h2>Log In</h2>

        <p className="text-muted">
          Don't have an account?{' '}
          <Link to="/register" className="text-link">
            Register
          </Link>
        </p>

        {location.state?.message && (
          <Alert kind="success">
            {location.state.message}
          </Alert>
        )}

        <Alert error={error} />

        <form onSubmit={submit}>
          <Field label="Email" name="email">
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </Field>

          <Field label="Password" name="password">
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </Field>

          <button
            className="btn btn-primary btn-block"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
      </section>
    </div>
  )
}
