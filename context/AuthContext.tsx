'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest, graphConfig } from '../config/auth';
import { InteractionRequiredAuthError } from '@azure/msal-browser';

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  user: { email: string; role: 'admin' | 'user' } | null;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { instance, accounts } = useMsal();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ email: string; role: 'admin' | 'user' } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const determineUserRole = (email: string): 'admin' | 'user' => {
    // You might want to replace this with a more robust check, possibly involving a backend API call
    return email.endsWith('@admin.com') ? 'admin' : 'user';
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
    return data;
  };

  useEffect(() => {
    const checkAuth = async () => {
      if (accounts.length > 0) {
        try {
          const result = await instance.acquireTokenSilent({
            ...loginRequest,
            account: accounts[0],
          });
          const userDetails = await fetchUserDetails(result.accessToken);
          const role = determineUserRole(userDetails.mail);
          setIsAuthenticated(true);
          setUser({ email: userDetails.mail, role });
          setError(null);
        } catch (err) {
          if (err instanceof InteractionRequiredAuthError) {
            setIsAuthenticated(false);
            setUser(null);
            setError("Admin consent required. Please contact your administrator.");
          }
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [accounts, instance]);

  const login = async () => {
    try {
      setError(null);
      const result = await instance.loginPopup(loginRequest);
      if (result.account) {
        const userDetails = await fetchUserDetails(result.accessToken);
        const role = determineUserRole(userDetails.mail);
        setIsAuthenticated(true);
        setUser({ email: userDetails.mail, role });
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      if (error.errorCode === "user_login_error") {
        setError("Admin consent required. Please contact your administrator.");
      } else {
        setError("Login failed. Please try again.");
      }
    }
  };

  const logout = async () => {
    try {
      await instance.logoutPopup();
      setIsAuthenticated(false);
      setUser(null);
      setError(null);
    } catch (error) {
      console.error('Logout failed:', error);
      setError("Logout failed. Please try again.");
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading, user, error }}>
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

