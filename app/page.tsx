import { redirect } from 'next/navigation'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/api/auth/signin')
  }

  if (session.user.role === 'admin') {
    redirect('/admin')
  } else {
    redirect('/request')
  }

  return null
}

