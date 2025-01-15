'use client'

import { Bell, Moon, Sun, LogOut, X } from 'lucide-react'
import Link from "next/link"
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useAuth } from '@/lib/auth'

export function Header() {
  const [isDark, setIsDark] = useState(false)
  const [, forceUpdate] = useState({})
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const [notifications, setNotifications] = useState<any[]>([]);  // State to hold notifications

  // Fetch the 3 most recent logs from the API
  const fetchLogs = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/sensor-maintenance');
      const data = await response.json();
      
      if (data.status === 'success') {
        // Filter for warnings and criticals, and take only the last 3 of each
        const logs = data.data
          .filter((log: any) => log.status === "Warning" || log.status === "Critical")  // Filter only "Warning" or "Critical" logs
          .slice(0, 3)  // Get the most recent 3 logs
          .map((log: any) => ({
            id: log.id,
            message: log.review,  // Use 'review' as the notification message
            sensorId: log.sensor_id,  // Show sensor ID
            status: log.status,  // Include the status (Warning or Critical)
            timestamp: log.datetime_review,  // Optionally include the timestamp
          }));
        
        // If there are new logs, update the notifications state
        setNotifications((prevNotifications) => {
          // Only add new notifications that are not already in the state
          const newNotifications = logs.filter((newNotification) =>
            !prevNotifications.some((existingNotification) => existingNotification.id === newNotification.id)
          );
          
          return [...newNotifications, ...prevNotifications]; // Add new notifications at the front
        });
      } else {
        console.error('Failed to fetch logs:', data.message);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  // Use useEffect to poll for new notifications every 30 seconds
  useEffect(() => {
    fetchLogs();  // Fetch on initial load
    const interval = setInterval(fetchLogs, 30000); // Poll every 30 seconds
    
    return () => clearInterval(interval);  // Cleanup the interval on unmount
  }, []);

  useEffect(() => {
    const timer = setInterval(() => forceUpdate({}), 1000);
    return () => clearInterval(timer);
  }, []);

  // Check if notifications have been cleared in localStorage
  useEffect(() => {
    const clearedNotifications = localStorage.getItem('clearedNotifications');
    if (clearedNotifications === 'true') {
      setNotifications([]);  // Clear notifications if user has cleared them
    }
  }, []);

  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.setItem('clearedNotifications', 'true');  // Store cleared state in localStorage
  };

  const removeNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const handleLogout = () => {
    logout()
    router.push('/sign-in')
  }

  return (
    <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2 text-green-500 dark:text-green-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6"
          >
            <path d="M12 2L7 7H3v4l5 5" />
            <path d="M12 2l5 5h4v4l-5 5" />
            <path d="M12 22V12" />
          </svg>
          <span className="font-semibold dark:text-white">Agrisense</span>
        </Link>
        <nav className="flex gap-6">
          <Link
            href="/dashboard"
            className={`font-medium px-3 py-2 rounded-md ${
              pathname === '/dashboard' ? 'bg-muted/50 dark:bg-gray-800' : 'text-muted-foreground hover:text-foreground dark:text-gray-300 dark:hover:text-white'
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/devices"
            className={`font-medium px-3 py-2 rounded-md ${
              pathname === '/devices' ? 'bg-muted/50 dark:bg-gray-800' : 'text-muted-foreground hover:text-foreground dark:text-gray-300 dark:hover:text-white'
            }`}
          >
            Devices & Sensors
          </Link>
          <Link
            href="/logs"
            className={`font-medium px-3 py-2 rounded-md ${
              pathname === '/logs' ? 'bg-muted/50 dark:bg-gray-800' : 'text-muted-foreground hover:text-foreground dark:text-gray-300 dark:hover:text-white'
            }`}
          >
            Logs
          </Link>
          <Link
            href="/maintenance"
            className={`font-medium px-3 py-2 rounded-md ${
              pathname === '/maintenance' ? 'bg-muted/50 dark:bg-gray-800' : 'text-muted-foreground hover:text-foreground dark:text-gray-300 dark:hover:text-white'
            }`}
          >
            Sensor Maintenance
          </Link>
          <Link
            href="/settings"
            className={`font-medium px-3 py-2 rounded-md ${
              pathname === '/settings' ? 'bg-muted/50 dark:bg-gray-800' : 'text-muted-foreground hover:text-foreground dark:text-gray-300 dark:hover:text-white'
            }`}
          >
            Settings
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">
                  {notifications.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            {notifications.length === 0 ? (
              <DropdownMenuItem>No new notifications</DropdownMenuItem>
            ) : (
              <>
                <div className="flex justify-between items-center p-2 border-b">
                  <span className="font-semibold">Warnings & Critical Logs</span>
                  <Button variant="ghost" size="sm" onClick={clearAllNotifications}>
                    Clear All
                  </Button>
                </div>
                {notifications.map((notification) => (
                  <DropdownMenuItem 
                    key={notification.id} 
                    className={`flex items-center justify-between p-2 rounded-md ${
                      notification.status === 'Warning' 
                        ? 'bg-yellow-300 bg-opacity-75 text-black p-4 rounded'
                        : notification.status === 'Critical' 
                        ? 'bg-red-600 bg-opacity-75 text-black p-4 rounded'
                        : ''
                    }`}
                  >
                    <span>{`${notification.message} (Sensor: ${notification.sensorId})`}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        removeNotification(notification.id);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </DropdownMenuItem>
                ))}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            document.documentElement.classList.toggle('dark')
            setIsDark(!isDark)
          }}
          className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
        >
          {isDark ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
        <time className="text-sm text-gray-600 dark:text-gray-300">
          {new Date().toLocaleString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
          })}
        </time>
        {user && (
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleLogout}
            className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        )}
      </div>
    </header>
  )
}
