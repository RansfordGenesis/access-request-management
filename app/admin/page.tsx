'use client';

import { AdminDashboard } from '@/components/admin-dashboard'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Header } from '@/components/header'

export default function AdminPage() {
  return (
    <ProtectedRoute adminOnly>
      <Header />
      <div className="container mx-auto py-10">
        <AdminDashboard />
      </div>
    </ProtectedRoute>
  )
}