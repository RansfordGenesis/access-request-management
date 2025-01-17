import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    userPrincipalName?: string; // Add the custom userPrincipalName property
  }

  interface Session {
    accessToken?: string;
    isAdmin?: boolean;
  }

  interface JWT {
    accessToken?: string;
    isAdmin?: boolean;
  }
}
