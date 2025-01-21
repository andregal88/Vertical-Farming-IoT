'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { EyeIcon, EyeOffIcon } from 'lucide-react'

export default function CreateAccountPage() {
  const [name, setName] = useState('')
  const [surname, setSurname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [userType, setUserType] = useState('user') // 'user' or 'admin'
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      alert('Passwords do not match')
      return
    }

    try {
      // Prepare payload for the API
      const payload = {
        name,
        surname,
        email,
        password,
        role_id: userType === 'admin' ? 1 : 2, 
      }

      // Send POST request to the API
      const response = await fetch('http://localhost:5200/create_account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || 'Failed to create account'}`)
        return
      }

      const data = await response.json()
      alert('Account created successfully!')
      console.log('API Response:', data)

      // Redirect to the sign-in page
      router.push('/sign-in')
    } catch (error) {
      console.error('Error creating account:', error)
      alert('An unexpected error occurred. Please try again later.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center text-green-800">Create an Account</CardTitle>
          <CardDescription className="text-center text-green-600">Join Agrisense to manage your vertical farm</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-green-700">First Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your first name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border-green-300 focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="surname" className="text-green-700">Last Name</Label>
              <Input
                id="surname"
                type="text"
                placeholder="Enter your last name"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                required
                className="w-full border-green-300 focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-green-700">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border-green-300 focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-green-700">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pr-10 border-green-300 focus:border-green-500 focus:ring-green-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-green-600 hover:text-green-800"
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-green-700">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pr-10 border-green-300 focus:border-green-500 focus:ring-green-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-green-600 hover:text-green-800"
                >
                  {showConfirmPassword ? (
                    <EyeOffIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-green-700">Account Type</Label>
              <RadioGroup value={userType} onValueChange={setUserType} className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="user" id="user" />
                  <Label htmlFor="user" className="text-green-700">User</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="admin" id="admin" />
                  <Label htmlFor="admin" className="text-green-700">Admin</Label>
                </div>
              </RadioGroup>
            </div>
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">Create Account</Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-green-700">
            Already have an account?{' '}
            <Link href="/sign-in" className="text-green-600 hover:text-green-800 hover:underline">
              Sign in here
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
