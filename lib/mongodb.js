import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI not defined inside environment variables')
}

let cached = global.mongoose || { conn: null, promise: null }
global.mongoose = cached

export async function connectDB() {
  if (cached.conn) {
    return cached.conn
  }
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance
    })
  }
  try {
    cached.conn = await cached.promise
    await runMigrations()
  } catch (e) {
    cached.promise = null
    throw e
  }
  return cached.conn
}

async function runMigrations() {
  if (global.dbMigrated) return

  try {
    const Organization = (await import('@/models/Organization')).default
    const User = (await import('@/models/User')).default
    const Product = (await import('@/models/Product')).default
    const Sale = (await import('@/models/Sale')).default
    const Supplier = (await import('@/models/Supplier')).default
    const StockMovement = (await import('@/models/StockMovement')).default
    const EmailLog = (await import('@/models/EmailLog')).default

    // 1. Ensure default organization exists
    let defaultOrg = await Organization.findOne({ name: 'Alpha Retailers' })
    if (!defaultOrg) {
      defaultOrg = await Organization.create({ name: 'Alpha Retailers' })
      console.log('Migration: Created Alpha Retailers organization.')
    }
    const defaultOrgId = defaultOrg._id

    // 2. Migrate Users
    const usersRes = await User.updateMany(
      { organizationId: { $exists: false } },
      { $set: { organizationId: defaultOrgId } }
    )
    if (usersRes.modifiedCount > 0) {
      console.log(`Migration: Updated ${usersRes.modifiedCount} users with Alpha Retailers ID.`)
    }


    // 4. Migrate Products
    await Product.updateMany(
      { organizationId: { $exists: false } },
      { $set: { organizationId: defaultOrgId } }
    )
    await Product.updateMany(
      { isArchived: { $exists: false } },
      { $set: { isArchived: false } }
    )

    // 5. Migrate Sales
    await Sale.updateMany(
      { organizationId: { $exists: false } },
      { $set: { organizationId: defaultOrgId } }
    )

    // 6. Migrate Suppliers
    await Supplier.updateMany(
      { organizationId: { $exists: false } },
      { $set: { organizationId: defaultOrgId } }
    )
    await Supplier.updateMany(
      { isArchived: { $exists: false } },
      { $set: { isArchived: false } }
    )

    // 7. Migrate StockMovements
    await StockMovement.updateMany(
      { organizationId: { $exists: false } },
      { $set: { organizationId: defaultOrgId } }
    )

    // 8. Migrate EmailLogs
    await EmailLog.updateMany(
      { organizationId: { $exists: false } },
      { $set: { organizationId: defaultOrgId } }
    )

    global.dbMigrated = true
    console.log('Migration: DB migrations completed successfully.')
  } catch (err) {
    console.error('Migration failed:', err)
  }
}
