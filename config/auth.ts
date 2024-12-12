import { Configuration } from "@azure/msal-browser";

const clientId = process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID;
const tenantId = process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID;
const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI;

if (!clientId || !tenantId || !redirectUri) {
  console.warn(
    "Missing MSAL configuration. Please check your environment variables."
  );
}

export const msalConfig: Configuration = {
  auth: {
    clientId: clientId ?? "",
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri: redirectUri,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ["User.Read", "profile", "email"]
};