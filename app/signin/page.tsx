'use client'

import { signIn } from 'next-auth/react'
import { Button } from "@/components/ui/button"

export default function SignIn() {
  const handleSignIn = () => {
    signIn('azure-ad', { callbackUrl: '/' })
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-6">Welcome to Access Request Management</h1>
        <Button onClick={handleSignIn}>Sign in with Microsoft</Button>
      </div>
    </div>
  )
}

