
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { homeForRole } from '../utils/format.js'

export default function ProtectedRoute({ roles, children }) {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    )
  }

  if (roles && !roles.includes(user?.role)) {
    return <Navigate to={homeForRole(user?.role)} replace />
  }

  return children
}
