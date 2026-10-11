
import { useEffect, useState } from 'react'
import {
  Alert,
  Field,
  Loading,
  PageHeading
} from '../components/UI.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { api, routes } from '../services/api.js'

export default function Profile() {
  const { user, updateUser } = useAuth()

  const [profile, setProfile] = useState(null)

  const [form, setForm] = useState({
    displayName: user?.displayName || '',
    contactMethod: user?.contactMethod || ''
  })

  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    let active = true

    api.get(routes.me)
      .then(data => {
        if (!active) return

        const profileData = data?.user || data

        setProfile(profileData)

        setForm({
          displayName: profileData.displayName || '',
          contactMethod: profileData.contactMethod || ''
        })

        updateUser(profileData)
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

  async function save(e) {
    e.preventDefault()

    const next = {}

    if (
      form.displayName.trim().length < 2 ||
      form.displayName.trim().length > 40
    ) {
      next.displayName =
        'Display name must be 2–40 characters.'
    }

    if (form.contactMethod.length > 120) {
      next.contactMethod =
        'Use no more than 120 characters.'
    }

    setErrors(next)
    setError(null)
    setMessage('')

    if (Object.keys(next).length) return

    setBusy(true)

    try {
      const data = await api.patch(routes.me, {
        displayName: form.displayName.trim(),
        contactMethod: form.contactMethod.trim()
      })

      const updated = data?.user || data

      setProfile(updated)
      updateUser(updated)
      setMessage('Profile updated successfully.')
    } catch (err) {
      setError(err)
      setErrors(err.fieldErrors || {})
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="narrow-page">
      <PageHeading
        eyebrow="MY ACCOUNT"
        title="My profile"
        subtitle="Update the details that other members can see."
      />

      <Alert error={error} />

      {message && (
        <Alert kind="success">
          {message}
        </Alert>
      )}

      {loading ? (
        <Loading />
      ) : (
        <div className="content-card">
          <div className="profile-head">
            <div className="profile-avatar">
              {(
                profile?.displayName ||
                user?.displayName ||
                'U'
              )[0].toUpperCase()}
            </div>

            <div>
              <h2>
                {profile?.displayName || 'Account'}
              </h2>

              <p>
                {profile?.email || user?.email || ''}
              </p>

              <span className="category-pill">
                {profile?.role || user?.role || 'Member'}
              </span>
            </div>
          </div>

          <form onSubmit={save} noValidate>
            <Field
              label="Display name"
              name="displayName"
              error={errors.displayName}
            >
              <input
                id="displayName"
                value={form.displayName}
                maxLength={40}
                onChange={e =>
                  setForm({
                    ...form,
                    displayName: e.target.value
                  })
                }
                required
              />
            </Field>

            <Field
              label="Contact method (optional)"
              name="contactMethod"
              error={errors.contactMethod}
              hint="Freelancer contact information is public on their gig pages."
            >
              <input
                id="contactMethod"
                value={form.contactMethod}
                maxLength={120}
                onChange={e =>
                  setForm({
                    ...form,
                    contactMethod: e.target.value
                  })
                }
              />
            </Field>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={busy}
            >
              {busy ? 'Saving…' : 'Save profile'}
            </button>
          </form>
        </div>
      )}
    </section>
  )
}
