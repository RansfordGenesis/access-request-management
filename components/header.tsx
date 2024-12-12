'use client'

import { useSession, signOut } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"

export function Header() {
  const { data: session } = useSession()

  const handleLogout = () => {
    signOut({ callbackUrl: '/signin' })
  }

  return (
    <header className="container mx-auto py-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold">Access Request Management</h1>
      <div className="flex items-center space-x-4">
        {session && (
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        )}
        <ModeToggle />
      </div>
    </header>
  )
}

