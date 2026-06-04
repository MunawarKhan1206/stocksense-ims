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
          name: user.name,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId ? user.organizationId.toString() : null,
          image: user.image || null,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.organizationId = user.organizationId
      }
      // If user logs in with Google, we make sure they exist in the database and have a role assigned
      if (account?.provider === 'google' && token.email) {
        await connectDB()
        let dbUser = await User.findOne({ email: token.email.toLowerCase() })
        if (!dbUser) {
          const Organization = (await import('../models/Organization')).default
          let defaultOrg = await Organization.findOne({ name: 'Alpha Retailers' })
          if (!defaultOrg) {
            defaultOrg = await Organization.create({ name: 'Alpha Retailers' })
          }
          // Auto create Google user
          dbUser = await User.create({
            name: token.name,
            email: token.email.toLowerCase(),
            role: 'inventory-staff', // default role
            organizationId: defaultOrg._id,
            image: token.picture,
          })
        }
        token.id = dbUser._id.toString()
        token.role = dbUser.role
        token.organizationId = dbUser.organizationId ? dbUser.organizationId.toString() : null
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.organizationId = token.organizationId
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    // Encrypted JWT session cookie for stateless multi-tenant SaaS authentication
    strategy: 'jwt',
    maxAge: 60 * 60 * 24, // 1 day session duration
    updateAge: 60 * 60,   // Refresh token session activity every 1 hour
  },
  secret: process.env.NEXTAUTH_SECRET,
}
