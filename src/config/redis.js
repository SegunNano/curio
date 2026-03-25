import { Redis } from 'ioredis'

const isDev= process.env.NODE_ENV===`development`

const url = isDev
? {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
}
: process.env.REDIS_URL
// For BullMQ
export const redisConnection = url

// For direct Redis operations (caching)
const redis = new Redis(url)

redis.on('connect', () => console.log('Redis connected 🟢'))
redis.on('error', (err) => console.error('Redis error:', err.message))

export default redis