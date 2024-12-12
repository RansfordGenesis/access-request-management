'use client';

import { MsalProvider as DefaultMsalProvider } from "@azure/msal-react";
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "../config/auth";
import { AuthProvider } from "../context/AuthContext";

let msalInstance: PublicClientApplication | null = null;

// Initialize MSAL Instance
const getMsalInstance = () => {
  if (!msalInstance) {
    msalInstance = new PublicClientApplication(msalConfig);
  }
  return msalInstance;
};

export default function MsalProvider({ children }: { children: React.ReactNode }) {
  return (
    <DefaultMsalProvider instance={getMsalInstance()}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </DefaultMsalProvider>
  );
}