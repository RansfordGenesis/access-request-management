'use client';

import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login, error } = useAuth();

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
            onClick={login}
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

