//src/types/next-auth.d.ts
import type { Adapter } from "@auth/core/adapters";
import type { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      emailVerified?: Date | null;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    emailVerified?: Date | null;
  }

  interface NextAuthOptions {
    adapter?: Adapter;
    debug?: boolean;
    secret?: string;
    session?: {
      strategy?: "jwt" | "database";
      maxAge?: number;
      updateAge?: number;
    };
    jwt?: {
      secret?: string;
      maxAge?: number;
      encode?: (token: JWT) => Promise<string>;
      decode?: (token: string) => Promise<JWT | null>;
    };
    pages?: {
      signIn?: string;
      signOut?: string;
      error?: string;
      verifyRequest?: string;
      newUser?: string;
    };
    callbacks?: {
      signIn?: (params: {
        user: User;
        account: {
          provider: string;
          type: string;
          providerAccountId: string;
        };
        profile?: {
          email?: string;
          name?: string;
          image?: string;
        };
        email?: { verificationRequest?: boolean };
        credentials?: Record<string, string>;
      }) => Promise<boolean | string> | boolean | string;
      redirect?: (params: {
        url: string;
        baseUrl: string;
      }) => Promise<string> | string;
      session?: (params: {
        session: Session;
        user: User;
        token: JWT;
      }) => Promise<Session> | Session;
      jwt?: (params: {
        token: JWT;
        user?: User;
        account?: {
          provider: string;
          type: string;
          providerAccountId: string;
        };
        profile?: {
          email?: string;
          name?: string;
          image?: string;
        };
        isNewUser?: boolean;
      }) => Promise<JWT> | JWT;
    };
    events?: {
      signIn?: (message: {
        user: User;
        account: {
          provider: string;
          type: string;
          providerAccountId: string;
        };
        profile?: {
          email?: string;
          name?: string;
          image?: string;
        };
        isNewUser?: boolean;
      }) => Promise<void> | void;
      signOut?: (message: {
        session: Session;
        token: JWT;
      }) => Promise<void> | void;
      createUser?: (message: { user: User }) => Promise<void> | void;
      updateUser?: (message: { user: User }) => Promise<void> | void;
      linkAccount?: (message: {
        user: User;
        account: {
          provider: string;
          type: string;
          providerAccountId: string;
        };
        profile: {
          email?: string;
          name?: string;
          image?: string;
        };
      }) => Promise<void> | void;
      session?: (message: {
        session: Session;
        token: JWT;
      }) => Promise<void> | void;
    };
    providers: Array<{
      id: string;
      name: string;
      type: string;
      authorize?: (credentials: Record<string, string>) => Promise<User | null>;
      clientId?: string;
      clientSecret?: string;
      accessTokenUrl?: string;
      requestTokenUrl?: string;
      authorizationUrl?: string;
      profileUrl?: string;
      profile?: (profile: Record<string, unknown>) => User | Promise<User>;
    }>;
  }
}
