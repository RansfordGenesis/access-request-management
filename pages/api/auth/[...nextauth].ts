import NextAuth from 'next-auth';
import AzureADProvider from 'next-auth/providers/azure-ad';

export default NextAuth({
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token || ""; // Ensure token is a string
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined; // Explicitly type accessToken
      return session;
    },
  },
  pages: {
    signIn: '/signin',
  },
});