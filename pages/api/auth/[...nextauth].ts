import NextAuth from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";

export default NextAuth({
  providers: [
    AzureADProvider({
      clientId: process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      console.log("JWT Callback Triggered");
      if (user) {
        const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL!;
        let email = user.email || user.userPrincipalName || "";

        if (email.includes("#EXT#")) {
          email = email.split("#EXT#")[0].replace("_", "@");
        }

        console.log("Resolved Email:", email);
        console.log("Admin Email from Env:", adminEmail);

        token.isAdmin = email === adminEmail ? true : false;

        console.log("Token isAdmin:", token.isAdmin);
      }

      if (account) {
        token.accessToken = account.access_token || ""; // Ensure string assignment
      }

      return token;
    },
    async session({ session, token }) {
      console.log("Session Callback Triggered");
      console.log("Token Data in Session:", token);

      session.isAdmin = typeof token.isAdmin === "boolean" ? token.isAdmin : false;
      console.log("Session isAdmin:", session.isAdmin);

      session.accessToken = typeof token.accessToken === "string" ? token.accessToken : "";
      console.log("Session accessToken:", session.accessToken);

      return session;
    },
  },
  debug: true, // Enable NextAuth debugging
  pages: {
    signIn: "/signin",
  },
});