import { Configuration, LogLevel } from "@azure/msal-browser";

const clientId = process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID;
const tenantId = process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID;

if (!clientId || !tenantId) {
  console.warn(
    "Missing MSAL configuration. Please check your environment variables."
  );
}

export const msalConfig: Configuration = {
  auth: {
    clientId: clientId ?? "",
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri: typeof window !== 'undefined' ? window.location.origin : undefined,
    postLogoutRedirectUri: typeof window !== 'undefined' ? window.location.origin : undefined,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
        }
      },
      logLevel: LogLevel.Verbose
    },
  },
};

export const loginRequest = {
  scopes: ["User.Read", "profile", "email", "openid"],
};

export const graphConfig = {
  graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
};

