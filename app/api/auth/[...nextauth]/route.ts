import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectToDatabase from "@/lib/db/mongodb";
import { User } from "@/lib/models/User";
import bcrypt from "bcryptjs";

interface AuthUser {
  id: string;
  email?: string | null;
  name?: string | null;
}

export const authOptions: NextAuthOptions = {
  // We are using JWT for sessions, so the adapter is not strictly required for credentials provider
  // and removing it can avoid potential connection/initialization issues during the login flow.
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        try {
          await connectToDatabase();
          
          // Find user by email
          const user = await User.findOne({ email: credentials.email });
          if (!user || !user.password) {
            throw new Error("No user found with this email");
          }

          // Verify password
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            throw new Error("Incorrect password");
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const user = session.user as AuthUser;
        user.id = token.id as string;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/signin",
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
