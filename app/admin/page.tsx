import { AdminDashboard } from '@/components/admin-dashboard'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Header } from '@/components/header'

export default function AdminPage() {
  return (
    <ProtectedRoute adminOnly>
      <Header />
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-5">Admin Dashboard</h1>
        <AdminDashboard />
      </div>
    </ProtectedRoute>
  )
}

