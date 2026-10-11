
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'

const AuthContext = createContext(null)

function loadAuth() {
  try {
    const token = sessionStorage.getItem('hh_token')
    const rawUser = sessionStorage.getItem('hh_user')

    return {
      token,
      user: token && rawUser ? JSON.parse(rawUser) : null
    }
  } catch {
    return { token: null, user: null }
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(loadAuth)

  const logout = useCallback(() => {
    sessionStorage.removeItem('hh_token')
    sessionStorage.removeItem('hh_user')
    setAuth({ token: null, user: null })
  }, [])

  const login = useCallback((token, user) => {
    if (!token || !user) {
      throw new Error(
        'The API did not return a token and user.'
      )
    }

    sessionStorage.setItem('hh_token', token)
    sessionStorage.setItem('hh_user', JSON.stringify(user))
    setAuth({ token, user })
  }, [])

  const updateUser = useCallback((user) => {
    setAuth(current => {
      if (!current.token) return current

      sessionStorage.setItem('hh_user', JSON.stringify(user))
      return { ...current, user }
    })
  }, [])

  useEffect(() => {
    window.addEventListener('hh:unauthorized', logout)

    return () =>
      window.removeEventListener('hh:unauthorized', logout)
  }, [logout])

  const value = useMemo(() => ({
    ...auth,
    isAuthenticated: Boolean(auth.token),
    login,
    logout,
    updateUser
  }), [auth, login, logout, updateUser])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be called inside AuthProvider')
  }

  return context
}
