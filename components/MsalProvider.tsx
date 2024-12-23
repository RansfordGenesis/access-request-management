'use client'

import { MsalProvider as MsalReactProvider } from "@azure/msal-react";
import { PublicClientApplication, EventType } from "@azure/msal-browser";
import { msalConfig } from "../config/auth";
import { useEffect, useState } from "react";

export default function MsalProvider({ children }: { children: React.ReactNode }) {
  const [msalInstance, setMsalInstance] = useState<PublicClientApplication | null>(null);

  useEffect(() => {
    const msalInstance = new PublicClientApplication(msalConfig);
    msalInstance.initialize().then(() => {
      msalInstance.addEventCallback((event) => {
        if (event.eventType === EventType.LOGIN_SUCCESS) {
          console.log("Login successful");
        }
      });
      setMsalInstance(msalInstance);
    });
  }, []);

  if (!msalInstance) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <MsalReactProvider instance={msalInstance}>
      {children}
    </MsalReactProvider>
  );
}

