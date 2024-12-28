import { NextAuthOptions } from "next-auth"
import AzureADProvider from "next-auth/providers/azure-ad"

export const authOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken
      return session
    },
  },
}

