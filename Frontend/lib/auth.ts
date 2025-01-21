import { useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  name: string;
  role: string;
  rooms: Array<{ room_id: number; room_name: string }>; // Updated to handle multiple rooms
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('authToken');
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  // Helper function to generate a random token (this can be replaced with a more secure JWT approach)
  const generateToken = () => {
    return Math.random().toString(36).substr(2) + Date.now().toString(36); // Random string with timestamp
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch('http://127.0.0.1:5111/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok && data) {
        const loggedInUser = {
          id: data.id,
          username: data.username,
          role: data.role,
          rooms: data.rooms, // Store the rooms array for the user
        };
  
        // Use the token from the backend response
        const token = data.token;
  
        // Store user info and token in localStorage
        localStorage.setItem('user', JSON.stringify(loggedInUser));
        localStorage.setItem('authToken', token); // Save the correct JWT token from backend
  
        setUser(loggedInUser);
  
        // Redirect based on the role and rooms
        if (data.role === 'Admin') {
          window.location.href = '/dashboard'; // Admin goes to the dashboard
        } else if (data.rooms && data.rooms.length > 0) {
          // If the user has multiple rooms, redirect them to the first room
          window.location.href = `/dashboard`; // Redirect to the first room
        } else {
          alert('No rooms assigned.');
        }
  
        return true;
      } else {
        console.log('Failed login response:', data);
        return false;
      }
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };
  
  

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken'); // Remove token on logout
    setUser(null);
  };

  return { user, loading, login, logout };
}
