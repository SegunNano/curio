import { Queue } from "bullmq";
import {  redisConnection } from "../config/redis.js";

const settings ={
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  },
}

const welcomeEmailQueue = new Queue('welcomeEmail', settings)
const newsFetchQueue = new Queue('newsFetch', settings)
const digestQueue = new Queue('digest', settings)
const inactivityQueue = new Queue('inactivity', settings)





export const addToWelcomeEmailQueue = (userId, name, email, verificationToken) =>{
  welcomeEmailQueue.add('welcome', {userId, name, email, verificationToken})
}
export const addToNewsFetchQueue = () => {
  newsFetchQueue.add('fetchNews', {})
}
export const addToDigestQueue = () => {
  digestQueue.add('sendDigests', {})
}
export const addToInactivityQueue = () => {
  inactivityQueue.add('checkInactivity', {})
}