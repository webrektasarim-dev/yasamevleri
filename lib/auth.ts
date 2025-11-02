import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email ve şifre gereklidir");
        }

        await dbConnect();

        const user = await User.findOne({ email: credentials.email });

        if (!user) {
          throw new Error("Kullanıcı bulunamadı");
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordCorrect) {
          throw new Error("Hatalı şifre");
        }

        // Admin onayı kontrolü
        if (!user.isApproved && user.role !== "admin") {
          throw new Error("Hesabınız henüz yönetici tarafından onaylanmamış. Lütfen onay bekleyin.");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          apartmentId: user.apartmentId?.toString(),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.apartmentId = (user as any).apartmentId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).apartmentId = token.apartmentId;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};







