'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"

export default function ForgotPasswordPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false) // Loading state for the button
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true) // Start loading

    try {
      const response = await fetch('http://localhost:5500/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          email: email,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(data.message) // Success message
        setTimeout(() => {
          router.push('/sign-in') // Redirect after success
        }, 3000)
      } else {
        setMessage(data.error) // Error message
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.")
    } finally {
      setIsLoading(false) // Stop loading
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-500">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center">Forgot Password</CardTitle>
          <CardDescription className="text-center">Enter your username and email to reset your password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending..." : "Reset Password"}
            </Button>
          </form>

          {/* Display success or error message */}
          {message && (
            <p className={`mt-4 text-center ${message.includes('error') ? 'text-red-500' : 'text-green-500'}`}>
              {message}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/sign-in" className="text-sm text-blue-600 hover:underline">
            Back to Sign In
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
