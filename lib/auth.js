import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { connectDB } from './mongodb'
import User from '../models/User'
import bcrypt from 'bcryptjs'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        await connectDB()
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter both email and password')
        }

        const user = await User.findOne({ email: credentials.email.toLowerCase() })
        if (!user) {
          throw new Error('No user found with this email')
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) {
          throw new Error('Incorrect password')
        }

        return {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      const newToken = {
        id: token?.id || token?.sub,
        email: token?.email,
        role: token?.role || 'staff',
      }

      if (user) {
        newToken.id = user.id
        newToken.email = user.email
        newToken.role = user.role
      }

      // If user logs in with Google, we make sure they exist in the database and have a role assigned
      if (account?.provider === 'google' && newToken.email) {
        await connectDB()
        let dbUser = await User.findOne({ email: newToken.email.toLowerCase() })
        if (!dbUser) {
          const Organization = (await import('../models/Organization')).default
          let defaultOrg = await Organization.findOne({ name: 'Alpha Retailers' })
          if (!defaultOrg) {
            defaultOrg = await Organization.create({ name: 'Alpha Retailers' })
          }
          // Auto create Google user
          dbUser = await User.create({
            name: token.name || 'Google User',
            email: newToken.email.toLowerCase(),
            role: 'inventory-staff', // default role
            organizationId: defaultOrg._id,
            image: token.picture,
          })
        }
        newToken.id = dbUser._id.toString()
        newToken.role = dbUser.role
      }
      return newToken
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        role: token.role,
        email: token.email,
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 7, // 7 days session duration
    updateAge: 60 * 60,       // Refresh token session activity every 1 hour
  },
  secret: process.env.NEXTAUTH_SECRET,
}
