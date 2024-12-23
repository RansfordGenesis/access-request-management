import { UserAccessDashboard } from '@/components/user-access-dashboard'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function UserAccessPage() {
  return (
    <ProtectedRoute adminOnly>
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-5">User Access Dashboard</h1>
        <UserAccessDashboard />
      </div>
    </ProtectedRoute>
  )
}

