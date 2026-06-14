import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { connectDB } from './mongodb'
import User from '../models/User'
import bcrypt from 'bcryptjs'

export const authOptions = {
  debug: true,

  providers: [
    CredentialsProvider({
      name: 'Credentials',

      credentials: {
        email: {
          label: 'Email',
          type: 'text',
        },
        password: {
          label: 'Password',
          type: 'password',
        },
      },

      async authorize(credentials) {
        try {
          console.log('=== LOGIN ATTEMPT START ===')

          if (!credentials?.email || !credentials?.password) {
            console.error('Missing email or password')
            throw new Error('Please enter both email and password')
          }

          console.log('Connecting to DB...')
          await connectDB()
          console.log('DB Connected')

          const email = credentials.email.toLowerCase().trim()

          console.log('Looking for user:', email)

          const user = await User.findOne({ email })

          if (!user) {
            console.error('User not found:', email)
            throw new Error('No user found with this email')
          }

          console.log('User found:', user.email)

          if (!user.password) {
            console.error('User has no password field')
            throw new Error(
              'This account does not have a password. Try Google Sign-In.'
            )
          }

          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          console.log('Password valid:', isValid)

          if (!isValid) {
            throw new Error('Incorrect password')
          }

          console.log('Login successful')

          return {
            id: user._id.toString(),
            email: user.email,
            role: user.role || 'staff',
          }
        } catch (error) {
          console.error('AUTHORIZE ERROR:', error)
          throw error
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
      try {
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

        if (account?.provider === 'google' && newToken.email) {
          await connectDB()

          let dbUser = await User.findOne({
            email: newToken.email.toLowerCase(),
          })

          if (!dbUser) {
            const Organization =
              (await import('../models/Organization')).default

            let defaultOrg = await Organization.findOne({
              name: 'Alpha Retailers',
            })

            if (!defaultOrg) {
              defaultOrg = await Organization.create({
                name: 'Alpha Retailers',
              })
            }

            dbUser = await User.create({
              name: token.name || 'Google User',
              email: newToken.email.toLowerCase(),
              role: 'inventory-staff',
              organizationId: defaultOrg._id,
              image: token.picture,
            })
          }

          newToken.id = dbUser._id.toString()
          newToken.role = dbUser.role
        }

        return newToken
      } catch (error) {
        console.error('JWT CALLBACK ERROR:', error)
        throw error
      }
    },

    async session({ session, token }) {
      try {
        session.user = {
          id: token.id,
          role: token.role,
          email: token.email,
        }

        return session
      } catch (error) {
        console.error('SESSION CALLBACK ERROR:', error)
        throw error
      }
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 7,
    updateAge: 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET,
}
