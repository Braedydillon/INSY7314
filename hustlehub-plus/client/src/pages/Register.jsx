
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, routes } from '../services/api.js'
import { Alert, Field } from '../components/UI.jsx'

export default function Register() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    surname: '',
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    contactMethod: '',
    role: 'client'
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [errors, setErrors] = useState({})

  function change(event) {
    setForm(previous => ({
      ...previous,
      [event.target.name]: event.target.value
    }))
  }

  async function submit(event) {
    event.preventDefault()
    setError(null)
    setErrors({})

    if (form.password !== form.confirmPassword) {
      setErrors({
        confirmPassword: 'Passwords do not match.'
      })
      return
    }

    if (
      form.password.length < 12 ||
      !/[A-Z]/.test(form.password) ||
      !/[a-z]/.test(form.password) ||
      !/[0-9]/.test(form.password) ||
      !/[^A-Za-z0-9]/.test(form.password)
    ) {
      setErrors({
        password:
          'Password needs at least 12 characters, uppercase, lowercase, number and symbol.'
      })
      return
    }

    setLoading(true)

    try {
      await api.post(routes.register, {
        name: form.name.trim(),
        surname: form.surname.trim(),
        displayName: form.displayName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
        contactMethod: form.contactMethod.trim()
      })

      navigate('/login', {
        replace: true,
        state: {
          message: 'Registration successful. Please log in.'
        }
      })
    } catch (err) {
      setError(err)
      setErrors(err.fieldErrors || {})
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-layout">
      <section className="auth-intro">
        <p className="eyebrow">HUSTLEHUB PLUS</p>
        <h1>Join the <em>community.</em></h1>
        <p>
          Create an account to book services
          or offer your skills as a freelancer.
        </p>
      </section>

      <section className="form-panel">
        <h2>Create Account</h2>

        <p className="text-muted">
          Already registered?{' '}
          <Link className="text-link" to="/login">
            Log In
          </Link>
        </p>

        <Alert error={error} />

        <form onSubmit={submit}>
          <div className="two-fields">
            <Field label="First Name" name="name" error={errors.name}>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={change}
                maxLength={50}
                required
              />
            </Field>

            <Field label="Surname" name="surname" error={errors.surname}>
              <input
                id="surname"
                name="surname"
                value={form.surname}
                onChange={change}
                maxLength={50}
                required
              />
            </Field>
          </div>

          <Field
            label="Display Name"
            name="displayName"
            error={errors.displayName}
          >
            <input
              id="displayName"
              name="displayName"
              value={form.displayName}
              onChange={change}
              maxLength={40}
              required
            />
          </Field>

          <Field label="Email" name="email" error={errors.email}>
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={change}
              required
            />
          </Field>

          <Field
            label="Password"
            name="password"
            error={errors.password}
            hint="At least 12 characters with uppercase, lowercase, number and symbol."
          >
            <input
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={change}
              minLength={12}
              required
            />
          </Field>

          <Field
            label="Confirm Password"
            name="confirmPassword"
            error={errors.confirmPassword}
          >
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={change}
              required
            />
          </Field>

          <Field
            label="Contact Method (Optional)"
            name="contactMethod"
            error={errors.contactMethod}
            hint="Your contact method may be shared with people you work with."
          >
            <input
              id="contactMethod"
              name="contactMethod"
              value={form.contactMethod}
              onChange={change}
              maxLength={120}
            />
          </Field>

          <Field label="Account Type" name="role" error={errors.role}>
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={change}
            >
              <option value="client">Client</option>
              <option value="freelancer">Freelancer</option>
            </select>
          </Field>

          <button
            className="btn btn-primary btn-block"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
      </section>
    </div>
  )
}
