import NextAuth from "next-auth"
import type { AuthOptions } from 'next-auth'
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  
  debug: process.env.NODE_ENV === 'development',
  
  pages: {
    signIn: '/auth/login',
    error: '/auth/error'
  },

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true
    }),

    Credentials({
      // Optionally define the credential fields to show on the default sign-in page
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // credentials can be undefined; guard before accessing properties
        if (!credentials?.email || !credentials?.password) return null

        try {
          const user = await prisma.user.findUnique({ where: { email: credentials.email } })
          if (!user || !user.password) return null

          const valid = await bcrypt.compare(credentials.password, user.password)
          return valid ? user : null
        } catch (err) {
          // Log server-side and fail the authorize gracefully without leaking internals to client
          console.error('Credentials authorize error:', err)
          return null
        }
      }
    })
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        console.log('SignIn callback:', { user: user?.email, provider: account?.provider })
        return true
      } catch (error) {
        console.error('SignIn callback error:', error)
        return false
      }
    },
    async session({ session, token }: any) {
      if (token?.sub) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id
      }
      return token
    }
  }
}

export default NextAuth(authOptions)
