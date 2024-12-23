'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function Home() {
  const { isAuthenticated, isLoading, user, login, error, checkAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      if (adminEmail && user.email.toLowerCase() === adminEmail.toLowerCase()) {
        router.push('/admin');
      } else {
        router.push('/request');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Access Request Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button 
            className="w-full" 
            onClick={() => login()}
          >
            Sign in with Microsoft
          </Button>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          {error?.includes("Admin consent") && (
            <p>
              Please contact your IT administrator to grant the necessary permissions for this application.
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

