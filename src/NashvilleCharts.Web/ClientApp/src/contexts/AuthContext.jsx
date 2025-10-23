import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await authApi.getCurrentUser()
      if (response.data.isAuthenticated) {
        setUser(response.data.user)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const register = async (email, password, displayName) => {
    try {
      const response = await authApi.register({ email, password, displayName })
      setUser(response.data.user)
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.errors?.join(', ') ||
                      error.response?.data?.error ||
                      'Registration failed'
      return { success: false, error: message }
    }
  }

  const loginWithPassword = async (email, password, rememberMe = false) => {
    try {
      const response = await authApi.loginWithPassword({ email, password, rememberMe })
      setUser(response.data.user)
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed'
      return { success: false, error: message }
    }
  }

  const loginWithProvider = (provider) => {
    authApi.loginWithProvider(provider)
  }

  const logout = async () => {
    try {
      await authApi.logout()
      setUser(null)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, register, loginWithPassword, loginWithProvider, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
