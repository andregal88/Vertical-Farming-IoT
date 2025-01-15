import { useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  name: string
  userType?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
      setLoading(false)
    }
    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    // Check if there's a new account
    const newAccountJson = localStorage.getItem('newAccount')
    let userToLogin: User | null = null

    if (newAccountJson) {
      const newAccount = JSON.parse(newAccountJson)
      if (email === newAccount.email && password === 'password') {
        userToLogin = {
          id: Date.now().toString(),
          email: newAccount.email,
          name: newAccount.email.split('@')[0],
          userType: newAccount.userType
        }
      }
    }

    // Existing login logic
    if (!userToLogin && email === 'admin@example.com' && password === 'password') {
      userToLogin = {
        id: '1',
        email: 'admin@example.com',
        name: 'Admin User',
        userType: 'admin'
      }
    }

    if (userToLogin) {
      localStorage.setItem('user', JSON.stringify(userToLogin))
      setUser(userToLogin)
      return true
    }

    return false
  }

  const logout = () => {
    localStorage.removeItem('user')
    setUser(null)
  }

  return { user, loading, login, logout }
}

