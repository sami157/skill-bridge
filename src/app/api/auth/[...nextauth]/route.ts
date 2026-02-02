import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const backendVerifyUrl =
  process.env.BACKEND_VERIFY_URL ??
  "https://skill-bridge-server-eight.vercel.app/api/auth/verify-credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const res = await fetch(backendVerifyUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });
        const data = await res.json();
        if (!data?.success || !data?.user) {
          throw new Error(
            typeof data?.message === "string" ? data.message : "Invalid email or password"
          );
        }
        const u = data.user;
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role ?? "STUDENT",
          image: u.image ?? undefined,
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
        (session.user as { id?: string }).id = (token.id as string) ?? token.sub ?? "";
        (session.user as { role?: string }).role = (token.role as string) ?? "STUDENT";
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
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
