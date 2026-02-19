import NextAuth, { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: { scope: "read:user user:email" },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Call backend API to create/update user
        const githubProfile = profile as { login?: string; name?: string };
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/createuser`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              image: user.image,
              githubId: account?.providerAccountId,
              githubUsername: githubProfile?.login || githubProfile?.name,
            }),
          },
        );

        if (!response.ok) {
          console.error(
            "Failed to create user in backend:",
            await response.text(),
          );
          return false;
        }

        const data = await response.json();
        console.log("User created/updated in backend:", data);

        // Store user data in session
        if (data.user) {
          user.id = data.user.id;
        }

        return true;
      } catch (error) {
        console.error("Error calling backend API:", error);
        return false;
      }
    },
    redirect: async ({ url, baseUrl }: { url: string; baseUrl: string }) => {
      // Prefer callback URL when provided and same-origin. Fall back to baseUrl.
      if (!url) return baseUrl;
      try {
        const resolved = new URL(url, baseUrl).toString();
        const baseOrigin = new URL(baseUrl).origin;
        if (new URL(resolved).origin === baseOrigin) return resolved;
        return baseUrl;
      } catch (e) {
        return baseUrl;
      }
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
