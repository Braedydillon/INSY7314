
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Layout({ children }) {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const links = [
    { to: '/gigs', label: 'Browse gigs' },

    ...(user?.role === 'client'
      ? [{ to: '/bookings', label: 'My bookings' }]
      : []),

    ...(user?.role === 'freelancer'
      ? [
          { to: '/dashboard/gigs', label: 'My gigs' },
          { to: '/dashboard/bookings', label: 'Requests' },
          { to: '/dashboard/income', label: 'Income' }
        ]
      : []),

    ...(['client', 'freelancer'].includes(user?.role)
      ? [{ to: '/transactions', label: 'Transactions' }]
      : []),

    ...(user?.role === 'admin'
      ? [{ to: '/admin', label: 'Admin' }]
      : [])
  ]

  function signOut() {
    logout()
    navigate('/')
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container nav-row">
          <Link
            className="logo"
            to="/"
            aria-label="HustleHub home"
          >
            <span className="logo-mark">H</span>
            {' '}Hustle<span className="accent-text">Hub</span>
            <span className="logo-plus">+</span>
          </Link>

          <nav aria-label="Main menu" className="navigation">
            {links.map(item => (
              <NavLink
                key={item.to}
                className={({ isActive }) =>
                  isActive ? 'nav-link active' : 'nav-link'
                }
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="nav-actions">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="account-chip"
                  aria-label="My profile"
                >
                  <span className="avatar-mini">
                    {(user?.displayName || user?.name || 'U')[0]
                      .toUpperCase()}
                  </span>
                  <span>
                    {user?.displayName || 'Profile'}
                  </span>
                </Link>

                <button
                  className="btn btn-quiet btn-sm"
                  type="button"
                  onClick={signOut}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  className="btn btn-quiet btn-sm"
                  to="/login"
                >
                  Log in
                </Link>
                <Link
                  className="btn btn-primary btn-sm"
                  to="/register"
                >
                  Join now
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container main-content">
        {children}
      </main>

      <footer className="site-footer">
        <div className="container footer-row">
          <span>HustleHub+ © {new Date().getFullYear()}</span>
          <span>Local talent. Real opportunities.</span>
        </div>
      </footer>
    </div>
  )
}
