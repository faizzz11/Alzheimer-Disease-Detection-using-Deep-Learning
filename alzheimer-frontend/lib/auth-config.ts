import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getCollections, getUserByEmail } from "@/lib/mongodb-collections";
import type { UserRole } from "@/models/User";

const googleConfigured =
  Boolean(process.env.GOOGLE_CLIENT_ID) &&
  Boolean(process.env.GOOGLE_CLIENT_SECRET);

export const authOptions: NextAuthOptions = {
  providers: [
    ...(googleConfigured
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            authorization: {
              params: {
                scope: "openid email profile",
                prompt: "consent",
                access_type: "offline",
                response_type: "code",
              },
            },
          }),
        ]
      : []),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  debug: process.env.NODE_ENV === "development",
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) {
        return false;
      }
      try {
        const collections = await getCollections();
        const existingUser = await getUserByEmail(user.email);
        if (!existingUser) {
          return `/auth/role-selection?email=${encodeURIComponent(user.email)}&name=${encodeURIComponent(user.name || "")}&image=${encodeURIComponent(user.image || "")}`;
        }
        if (!existingUser.role) {
          return `/auth/role-selection?email=${encodeURIComponent(user.email)}&name=${encodeURIComponent(user.name || "")}&image=${encodeURIComponent(user.image || "")}`;
        }
        if (account) {
          const dbUser = await getUserByEmail(user.email);
          if (dbUser?._id) {
            await collections.accounts.updateOne(
              {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              },
              {
                $set: {
                  userId: dbUser._id,
                  type: account.type,
                  access_token: account.access_token,
                  refresh_token: account.refresh_token,
                  expires_at: account.expires_at,
                  scope: account.scope,
                  token_type: account.token_type,
                  id_token: account.id_token,
                  session_state: account.session_state,
                  updated_at: new Date(),
                },
              },
              { upsert: true },
            );
          }
        }
        return true;
      } catch (e) {
        console.error("signIn callback:", e);
        return false;
      }
    },
    async jwt({ token, account, user, trigger, session }) {
      try {
        if (account) {
          token.accessToken = account.access_token;
          token.refreshToken = account.refresh_token;
          token.expiresAt = account.expires_at;
          token.scope = account.scope;
        }
        const email = user?.email ?? token.email;
        if (email) {
          const dbUser = await getUserByEmail(email);
          if (dbUser) {
            token.role = dbUser.role;
            token.userId = dbUser._id?.toString();
          }
        }
        if (trigger === "update" && session?.role) {
          token.role = session.role as UserRole;
          token.iat = Math.floor(Date.now() / 1000);
        }
        return token;
      } catch (e) {
        console.error("jwt callback:", e);
        return token;
      }
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      session.refreshToken = token.refreshToken as string | undefined;
      session.expiresAt = token.expiresAt as number | undefined;
      session.scope = token.scope as string | undefined;
      session.role = token.role as UserRole | undefined;
      session.userId = token.userId as string | undefined;
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/auth/role-selection")) {
        return `${baseUrl}${url}`;
      }
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
};
