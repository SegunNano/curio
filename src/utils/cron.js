import cron from 'node-cron'
import { addToNewsFetchQueue, addToDigestQueue} from '../queues/queue.js'

const startCron = () => {
  cron.schedule(process.env.CRON_NEWS_FETCH || '0 6 * * *',  () => {
    console.log('News fetch job queued 🗞️')
   addToNewsFetchQueue()
  })
   cron.schedule(process.env.CRON_DIGEST || '0 8 * * *', () => {
    console.log('Digest job queued 📧')
    addToDigestQueue()
  })

  // Runs every day at midnight
  cron.schedule(process.env.CRON_INACTIVITY || '0 0 * * *', () => {
    console.log('Inactivity check queued 🔍')
    addToInactivityQueue()
})
}

export default startCron