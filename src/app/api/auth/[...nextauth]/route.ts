import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://skill-bridge-server-eight.vercel.app";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const res = await fetch(`${BACKEND_URL}/api/auth/verify-credentials`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data?.user) return null;
        const u = data.user;
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          image: u.image ?? undefined,
          role: u.role ?? "STUDENT",
        };
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
        (session.user as { id?: string }).id = token.sub ?? "";
        (session.user as { role?: string }).role = (token.role as string) ?? "STUDENT";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies: process.env.NODE_ENV === "production",
  cookies: process.env.NODE_ENV === "production"
    ? {
        sessionToken: {
          name: "next-auth.session-token",
          options: {
            httpOnly: true,
            sameSite: "none",
            path: "/",
            secure: true,
          },
        },
      }
    : undefined,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
