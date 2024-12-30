'use client'

import { signIn } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function SignIn() {
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      if (session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        router.push('/admin');
      } else {
        router.push('/request');
      }
    }
  }, [status, session, router]);

  const handleSignIn = () => {
    signIn('azure-ad', { callbackUrl: '/' })
  }

  if (status === 'loading') {
    return <div>Loading...</div>
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

