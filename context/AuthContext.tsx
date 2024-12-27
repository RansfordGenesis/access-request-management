'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest, graphConfig } from '../config/auth';
import { InteractionRequiredAuthError, AccountInfo, EventType, EventMessage, AuthenticationResult, InteractionStatus } from '@azure/msal-browser';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  isLoading: boolean;
  user: { email: string; name: string; role: 'admin' | 'user' } | null;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { instance, accounts, inProgress } = useMsal();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ email: string; name: string; role: 'admin' | 'user' } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const determineUserRole = (email: string): 'admin' | 'user' => {
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    return email.toLowerCase() === adminEmail?.toLowerCase() ? 'admin' : 'user';
  };

  const fetchUserDetails = async (accessToken: string) => {
    const response = await fetch(graphConfig.graphMeEndpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user details');
    }

    const data = await response.json();
    return {
      ...data,
      mail: data.mail || data.userPrincipalName || null,
      name: data.displayName || data.givenName || 'Unknown User',
    };
  };

  const checkAuth = useCallback(async () => {
    if (accounts.length > 0) {
      try {
        await handleAccountSignIn(accounts[0]);
      } catch (error) {
        console.error('Error during authentication check:', error);
        setError("An error occurred during authentication check. Please try logging in again.");
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
    }
  }, [accounts]);

  useEffect(() => {
    const handleAuth = async () => {
      if (inProgress === InteractionStatus.None) {
        await checkAuth();
      }
    };

    handleAuth();
  }, [inProgress, checkAuth]);

  useEffect(() => {
    const callbackId = instance.addEventCallback((event: EventMessage) => {
      if (event.eventType === EventType.LOGIN_SUCCESS) {
        const result = event.payload as AuthenticationResult;
        handleAuthenticationResult(result);
      }
    });

    return () => {
      if (callbackId) {
        instance.removeEventCallback(callbackId);
      }
    };
  }, [instance]);

  const handleAuthenticationResult = async (result: AuthenticationResult) => {
    if (result.account) {
      await handleAccountSignIn(result.account);
    } else {
      setIsLoading(false);
    }
  };

  const handleAccountSignIn = async (account: AccountInfo) => {
    try {
      const accessToken = await instance.acquireTokenSilent({
        ...loginRequest,
        account: account
      });
      const userDetails = await fetchUserDetails(accessToken.accessToken);
      const role = determineUserRole(userDetails.mail);
      setIsAuthenticated(true);
      setUser({ email: userDetails.mail || 'Unknown', name: userDetails.name, role });
      setError(null);

      // Route user based on role
      if (role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/request');
      }
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        try {
          await instance.acquireTokenRedirect(loginRequest);
        } catch (redirectError) {
          console.error('Error during redirect token acquisition:', redirectError);
          setError("Failed to acquire access token. Please try logging in again.");
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        console.error('Error during silent token acquisition:', error);
        setError("Failed to acquire access token. Please try logging in again.");
        setIsAuthenticated(false);
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async () => {
    try {
      setError(null);
      await instance.loginRedirect(loginRequest);
    } catch (error: any) {
      console.error('Login failed:', error);
      setError("Login failed. Please try again.");
    }
  };

  const logout = async () => {
    try {
      await instance.logoutRedirect({
        postLogoutRedirectUri: window.location.origin,
      });
    } catch (error) {
      console.error('Logout failed:', error);
      setError("Logout failed. Please try again.");
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      router.push('/');
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, checkAuth, isLoading, user, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

