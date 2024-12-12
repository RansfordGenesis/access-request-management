import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Access Request Management System</h1>
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">For Users:</h2>
          <Link href="/request">
            <Button>Go to Request Page</Button>
          </Link>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">For Admins:</h2>
          <Link href="/admin">
            <Button>Go to Admin Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

