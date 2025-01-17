'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"

export function Header() {
  const { isAuthenticated, logout, user } = useAuth()
  const router = useRouter();

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <header className="container mx-auto py-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold">Access Request Management</h1>
      <div className="flex items-center space-x-4">
        <span>{user.name}</span>
        <Button variant="outline" onClick={() => {
          logout();
          router.push('/');
        }}>
          Logout
        </Button>
        <ModeToggle />
      </div>
    </header>
  )
}