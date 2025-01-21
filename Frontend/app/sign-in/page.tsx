'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

export default function SignInPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login, user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const success = await login(username, password);

    if (success) {
      console.log('User:', user); // Check the user data in the console

      // If the user is an Admin
      if (user?.role === 'Admin') {
        router.push('/dashboard'); // Admins go to dashboard
      } else if (user?.rooms && user?.rooms.length > 0) {
        // Check if rooms are assigned and redirect to the first room
        router.push(`/rooms/${user.rooms[0].room_id}`);
      } 
    } else {
      alert('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-100 relative">
      <Image
        src="/Frontend/farm-background.jpg"
        alt="Vertical Farm"
        layout="fill"
        objectFit="cover"
        quality={100}
        className="absolute inset-0 z-0"
      />
      <div className="absolute inset-0 bg-black opacity-50 z-10"></div>
      <Card className="w-full max-w-md z-20 bg-white bg-opacity-90">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center text-green-800">Welcome to Agrisense</CardTitle>
          <CardDescription className="text-center text-green-600">Sign in to manage your vertical farm</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-green-700">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full border-green-300 focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-green-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
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
                  {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">
              Sign In
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Link href="/forgot-password" className="text-sm text-green-600 hover:text-green-800 hover:underline">
            Forgot password?
          </Link>
          <div className="text-sm text-green-700">
            Don't have an account?{' '}
            <Link href="/create-account" className="text-green-600 hover:text-green-800 hover:underline">
              Create one here
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
