import NextAuth, { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";

// Helper to get hackathon slug from cookie (server-side)
function getHackathonSlugFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'hackathonSlug') {
      return value;
    }
  }
  return null;
}

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
          
          // Check if there's a website slug in the callback URL to register the user
          // The slug will be extracted from the callbackUrl
          const callbackUrl = (account as any)?.callbackUrl || "";
          const slugMatch = callbackUrl.match(/\/w\/([^\/]+)/);
          
          if (slugMatch && slugMatch[1]) {
            const slug = slugMatch[1];
            console.log("Registering user to website with slug:", slug);
            
            try {
              const registrationResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/registration/register`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    userId: data.user.id,
                    slug: slug,
                  }),
                },
              );

              if (registrationResponse.ok) {
                const registrationData = await registrationResponse.json();
                console.log("User registered to website:", registrationData);
              } else {
                console.error("Failed to register user to website:", await registrationResponse.text());
              }
            } catch (regError) {
              console.error("Error registering user to website:", regError);
              // Don't fail the sign-in if registration fails
            }
          }
        }

        return true;
      } catch (error) {
        console.error("Error calling backend API:", error);
        return false;
      }
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }
      if (account?.provider === "github" && profile) {
        const githubProfile = profile as { login?: string };
        token.username = githubProfile.login;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture as string;
        session.user.username = token.username;
      }
      return session;
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
