'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest, graphConfig } from '../config/auth';
import { InteractionRequiredAuthError, AccountInfo, EventType, EventMessage, AuthenticationResult, InteractionStatus } from '@azure/msal-browser';

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  isLoading: boolean;
  user: { email: string; role: 'admin' | 'user' } | null;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { instance, accounts, inProgress } = useMsal();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ email: string; role: 'admin' | 'user' } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const determineUserRole = (email: string): 'admin' | 'user' => {
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

  const checkAuth = async () => {
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
  };

  useEffect(() => {
    const handleAuth = async () => {
      if (inProgress === InteractionStatus.None) {
        await checkAuth();
      }
    };

    handleAuth();
  }, [accounts, inProgress]);

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
      setUser({ email: userDetails.mail, role });
      setError(null);
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        try {
          await instance.acquireTokenPopup(loginRequest);
          await checkAuth();
        } catch (popupError) {
          console.error('Error during popup token acquisition:', popupError);
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
      await instance.loginPopup(loginRequest);
    } catch (error: any) {
      console.error('Login failed:', error);
      setError("Login failed. Please try again.");
    }
  };

  const logout = async () => {
    try {
      await instance.logoutPopup();
    } catch (error) {
      console.error('Logout failed:', error);
      setError("Logout failed. Please try again.");
    } finally {
      setIsAuthenticated(false);
      setUser(null);
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

