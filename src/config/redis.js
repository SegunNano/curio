import { Redis } from 'ioredis'



// For direct Redis operations (caching)
const redis = new Redis(process.env.REDIS_URL)

// For BullMQ
export const redisConnection = redis
redis.on('connect', () => console.log('Redis connected 🟢'))
redis.on('error', (err) => console.error('Redis error:', err.message))

export default redis