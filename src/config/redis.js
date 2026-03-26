import { Redis } from 'ioredis'

// For BullMQ — maxRetriesPerRequest MUST be null
export const redisConnection = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
})

// For direct Redis operations (caching)
const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
})

redis.on('connect', () => console.log('Redis connected 🟢'))
redis.on('error', (err) => console.error('Redis error:', err.message))

export default redis