// next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string; // Add the custom property
  }

  interface JWT {
    accessToken?: string; // Add the custom property
  }
}