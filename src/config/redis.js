import { Redis } from 'ioredis'

// For BullMQ
export const redisConnection = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
}

// For direct Redis operations (caching)
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
})

redis.on('connect', () => console.log('Redis connected 🟢'))
redis.on('error', (err) => console.error('Redis error:', err.message))

export default redis