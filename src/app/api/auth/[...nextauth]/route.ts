import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { jwtVerify } from "jose";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        const token = credentials?.token;
        if (!token || typeof token !== "string") return null;
        const secret = process.env.NEXTAUTH_SECRET;
        if (!secret) return null;
        try {
          const { payload } = await jwtVerify(
            token,
            new TextEncoder().encode(secret)
          );
          const sub = payload.sub;
          if (!sub) return null;
          return {
            id: sub,
            name: (payload.name as string) ?? "",
            email: (payload.email as string) ?? "",
            role: (payload.role as string) ?? "STUDENT",
            image: (payload.image as string) ?? undefined,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (session.user) {
        (session.user as { id?: string }).id = (token.id as string) ?? token.sub ?? "";
        (session.user as { role?: string }).role = (token.role as string) ?? "STUDENT";
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies: process.env.NODE_ENV === "production",
  cookies:
    process.env.NODE_ENV === "production"
      ? {
          sessionToken: {
            name: "next-auth.session-token",
            options: {
              httpOnly: true,
              sameSite: "lax",
              path: "/",
              secure: true,
            },
          },
        }
      : undefined,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
