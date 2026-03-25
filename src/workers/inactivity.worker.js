import { Worker } from 'bullmq'
import redis, { redisConnection } from '../config/redis.js'
import User from '../models/user.model.js'




const inactivityWorker = new Worker(
  'inactivity',
  async () => {
    console.log('Processing inactivity check... 🔍')

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const inactiveUsers = await User.find(
      {
        status: 'active',
        lastActiveAt: { $lt: thirtyDaysAgo }
      },
      { _id: 1 }
    ).lean()

    if (inactiveUsers.length === 0) {
      console.log('No inactive users found ✅')
      return
    }

    const ids = inactiveUsers.map(u => u._id)

    await User.updateMany(
      { _id: { $in: ids }, status: 'active' },
      { $set: { status: 'inactive' } }
    )

    const pipeline = redis.pipeline()
    ids.forEach(id => pipeline.del(`user:${id}`))
    await pipeline.exec()

    console.log(`${ids.length} users marked inactive 🔴`)
  },
  { connection: redisConnection }
)

inactivityWorker.on('completed', () => console.log('Inactivity check completed ✅'))
inactivityWorker.on('failed', (job, err) => console.error('Inactivity check failed:', err.message))

export default inactivityWorker