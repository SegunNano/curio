import { Worker } from "bullmq";
import { redisConnection } from "../config/redis.js";
import { sendVerificationEmail } from "../services/resend.service.js";


const welcomeEmailWorker = new Worker(
    'welcomeEmail',
    async(job) =>{
        const { userId, name, email, verificationToken} = job.data
        console.log(`Sending welcome email to ${email} 📧`);
       
    const verificationUrl = `${process.env.BASE_URL}/auth/verify/${verificationToken}`
    await sendVerificationEmail({ name, email, verificationUrl })
    }, {connection: redisConnection}
)

welcomeEmailWorker.on('failed', (job, err) => {
  console.error(`Verification email failed for ${job.data.email}:`, err.message)
})

export default welcomeEmailWorker