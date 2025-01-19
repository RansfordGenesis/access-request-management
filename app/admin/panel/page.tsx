'use client';

import { AdminPanel } from '@/components/admin-panel';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function AdminPanelPage() {
  return (
    <ProtectedRoute adminOnly>
      <AdminPanel />
    </ProtectedRoute>
  );
}