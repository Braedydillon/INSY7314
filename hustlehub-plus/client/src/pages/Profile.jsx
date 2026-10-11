
import { useEffect, useState } from 'react'
import { api, routes } from '../services/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import {
  PageHeading,
  Field,
  Loading,
  Alert
} from '../components/UI.jsx'

export default function Profile() {
  const { user, updateUser } = useAuth()

  const [form, setForm] = useState({
    displayName: user?.displayName || '',
    contactMethod: user?.contactMethod || ''
  })

  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let active = true

    api.get(routes.me)
      .then(data => {
        if (!active) return

        const profile = data.user || data

        setForm({
          displayName: profile.displayName || '',
          contactMethod: profile.contactMethod || ''
        })

        updateUser(profile)
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
  }, [updateUser])

  async function save(event) {
    event.preventDefault()
    setError(null)
    setSuccess('')

    if (
      form.displayName.trim().length < 2 ||
      form.displayName.trim().length > 40 ||
      form.contactMethod.length > 120
    ) {
      setError(new Error(
        'Display name must have 2–40 characters and contact method at most 120.'
      ))
      return
    }

    setBusy(true)

    try {
      const data = await api.patch(routes.me, {
        displayName: form.displayName.trim(),
        contactMethod: form.contactMethod.trim()
      })

      updateUser(data.user || data)
      setSuccess('Profile updated successfully.')
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="narrow-page">
      <PageHeading
        eyebrow="MY ACCOUNT"
        title="My Profile"
        subtitle="Update your account information."
      />

      <Alert error={error} />

      {success && (
        <Alert kind="success">{success}</Alert>
      )}

      {loading ? (
        <Loading />
      ) : (
        <div className="content-card">
          <div className="profile-head">
            <div className="profile-avatar">
              {(user?.displayName || 'U')[0].toUpperCase()}
            </div>

            <div>
              <h2>{user?.displayName || 'My Account'}</h2>
              <p>{user?.email}</p>
              <span className="category-pill">
                {user?.role}
              </span>
            </div>
          </div>

          <form onSubmit={save}>
            <Field label="Display Name" name="displayName">
              <input
                id="displayName"
                value={form.displayName}
                onChange={e =>
                  setForm(previous => ({
                    ...previous,
                    displayName: e.target.value
                  }))
                }
                maxLength={40}
                required
              />
            </Field>

            <Field
              label="Contact Method"
              name="contactMethod"
              hint="Your contact method may be visible to people you work with."
            >
              <input
                id="contactMethod"
                value={form.contactMethod}
                onChange={e =>
                  setForm(previous => ({
                    ...previous,
                    contactMethod: e.target.value
                  }))
                }
                maxLength={120}
              />
            </Field>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={busy}
            >
              {busy ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
