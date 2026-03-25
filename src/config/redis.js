import { Redis } from 'ioredis'

// For BullMQ
export const redisConnection = {
  connection: {
    url: process.env.REDIS_URL,
  },
}

// For direct Redis operations (caching)
const redis = new Redis(process.env.REDIS_URL)

redis.on('connect', () => console.log('Redis connected 🟢'))
redis.on('error', (err) => console.error('Redis error:', err.message))

export default redis