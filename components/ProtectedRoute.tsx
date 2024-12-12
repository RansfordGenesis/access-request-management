'use client';

import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import LoginPage from './LoginPage';
import { useRouter } from 'next/navigation';

export default function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const isAdmin = user?.email.endsWith('@admin.com');
      if (adminOnly && !isAdmin) {
        router.push('/request');
      } else if (!adminOnly && isAdmin) {
        router.push('/admin');
      }
    }
  }, [isLoading, isAuthenticated, user, adminOnly, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <>{children}</>;
}

