import 'dotenv/config'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import User from '../models/user.model.js'


const users = [
  {
    name: 'Segun Fadipe',
    email: 'segun@example.com',
    password: 'password123',
    status: 'active',
    categories: ['technology', 'science', 'education'],
    digestFrequency: 1,
  },
  {
    name: 'Amaka Obi',
    email: 'amaka@example.com',
    password: 'password123',
    status: 'active',
    categories: ['health', 'food', 'lifestyle'],
    digestFrequency: 2,
  },
  {
    name: 'Chidi Nwosu',
    email: 'chidi@example.com',
    password: 'password123',
    status: 'active',
    categories: ['sports', 'entertainment', 'crime'],
    digestFrequency: 3,
  },
  {
    name: 'Fatima Aliyu',
    email: 'fatima@example.com',
    password: 'password123',
    status: 'active',
    categories: ['politics', 'world', 'business'],
    digestFrequency: 5,
  },
  {
    name: 'Emeka Eze',
    email: 'emeka@example.com',
    password: 'password123',
    status: 'active',
    categories: ['technology', 'business', 'world'],
    digestFrequency: 7,
  },
  {
    name: 'Ngozi Adeyemi',
    email: 'ngozi@example.com',
    password: 'password123',
    status: 'inactive',
    categories: ['lifestyle', 'food', 'health'],
    digestFrequency: 3,
    lastActiveAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000), // 35 days ago
  },
  {
    name: 'Tunde Bakare',
    email: 'tunde@example.com',
    password: 'password123',
    status: 'unverified',
    categories: ['sports', 'entertainment'],
    digestFrequency: 2,
  },
  {
    name: 'Blessing Okoro',
    email: 'blessing@example.com',
    password: 'password123',
    status: 'active',
    categories: ['education', 'science', 'technology'],
    digestFrequency: 4,
  },
  {
    name: 'Kehinde Lawal',
    email: 'kehinde@example.com',
    password: 'password123',
    status: 'active',
    categories: ['crime', 'politics', 'world'],
    digestFrequency: 1,
  },
  {
    name: 'Zainab Musa',
    email: 'zainab@example.com',
    password: 'password123',
    status: 'active',
    categories: ['business', 'technology', 'environment'],
    digestFrequency: 3,
  },
]

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB connected 🟢')

    // Clear existing users
    // await User.deleteMany({})
    console.log('Existing users cleared 🗑️')

    // Hash passwords and create users
    const hashedUsers = await Promise.all(
      users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 12),
        lastActiveAt: user.lastActiveAt || new Date(),
      }))
    )

    await User.insertMany(hashedUsers)
    console.log(`✅ ${hashedUsers.length} users seeded successfully!`)

    mongoose.connection.close()
  } catch (error) {
    console.error('Seeding error:', error.message)
    mongoose.connection.close()
    process.exit(1)
  }
}

seedUsers()