import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { logger } from "@/lib/logger";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {},

      async authorize(credentials) {
        const { email, password } = credentials;

        try {
          await connectMongoDB();
          const user = await User.findOne({ email });

          if (!user) {
            return null;
          }

          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (!passwordsMatch) {
            return null;
          }
          logger(user._id, "Login", "Logged in", 200);
          return user;
        } catch (error) {
          console.log("Error: ", error);
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 3600,
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session?.hasDefaultPassword !== undefined) {
        token.hasDefaultPassword = session.hasDefaultPassword;
        return token;
      }

      if (user) {
        // Store all user fields in token
        token.userType = user.userType;
        token.userId = user._id;
        token.hasDefaultPassword = user.password === "$2a$10$OTAVa.umH/vANyQ53DCpCOM9XrKAguEatocXzWSUQiXFSEIyTYcqG";
        token.name = user.name;
        token.email = user.email;
        token.college = user.college;
        token.dept = user.dept;
        token.role = user.role;
        token.phone = user.phone;
        token.id = user.id;  // Staff ID
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        // Pass all fields from token to session
        session.user = {
          userType: token.userType,
          userId: token.userId,
          hasDefaultPassword: token.hasDefaultPassword,
          name: token.name,
          email: token.email,
          college: token.college,
          dept: token.dept,
          role: token.role,
          phone: token.phone,
          id: token.id  // Staff ID
        };
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
