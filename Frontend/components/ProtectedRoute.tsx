import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // This ensures the component is mounted on the client-side before accessing `useRouter`
    setIsClient(true);
  }, []);

  // Only render the ProtectedRoute when the component is mounted on the client
  if (!isClient) {
    return null;  // Prevents accessing `useRouter` on the server side
  }

  if (loading) {
    return <div>Loading...</div>; // Add loading spinner or message
  }

  if (!user || !allowedRoles.includes(user.role)) {
    // Redirect to a different page if the user is not authenticated or doesn't have the correct role
    router.push('/login');  // Adjust the redirect URL as needed
    return null;
  }

  return <>{children}</>; // Render children if the user is authorized
};

export default ProtectedRoute;
