// /app/lib/auth.ts
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { createOAuthUser, findUserByEmail, updateUserWithOAuth } from "@/app/lib/db";
import { Credentials } from "@/app/lib/types";
import { Account, Profile, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";
import * as bcrypt from "bcryptjs";

export const NEXT_AUTH = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: Credentials | undefined) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await findUserByEmail(credentials.email);
        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account }: { 
      user: User; 
      account: Account | null; 
      profile?: Profile 
    }) {
      if (account?.provider === "github" || account?.provider === "google") {
        const existingUser = await findUserByEmail(user.email!);

        if (!existingUser) {
          await createOAuthUser(
            user.email!,
            user.name!,
            account.provider,
            account.providerAccountId,
          );
        } else if (!existingUser.oauthProvider || !existingUser.oauthId) {
          await updateUserWithOAuth(
            user.email!,
            account.provider,
            account.providerAccountId,
          );
        }
      }
      return true;
    },
    jwt: ({ token }: { token: JWT }) => {
      token.userId = token.sub;
      return token;
    },
    session: ({ session, token }: { session: Session; token: JWT }) => {
      if (session.user) {
        session.user.id = token.userId;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};