import { useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  name: string
}

const fakeUser: User = {
  id: '1',
  email: 'admin@example.com',
  name: 'Admin User',
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken')
      if (token) {
        // In a real app, you'd verify the token with your API
        setUser(fakeUser)
      }
      setLoading(false)
    }
    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    // In a real app, you'd make an API call to verify credentials
    if (email === 'admin@example.com' && password === 'password') {
      const fakeToken = 'fake-jwt-token'
      localStorage.setItem('authToken', fakeToken)
      setUser(fakeUser)
      return true
    }
    return false
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    setUser(null)
  }

  return { user, loading, login, logout }
}

