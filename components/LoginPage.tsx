'use client';

import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Access Request Form</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            className="w-full" 
            onClick={login}
          >
            Sign in with Microsoft
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}