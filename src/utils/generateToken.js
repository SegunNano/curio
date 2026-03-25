import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { addToWelcomeEmailQueue } from '../queues/queue.js';

const generateToken = (res, userId)=>{
const token = jwt.sign({userId}, process.env.JWT_SECRET, { expiresIn: '7d' })

res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict',
    maxAge: 7 *24 * 60 * 60 * 1000
});
return token
}

export const recreateToken = async(user) =>{
     const verificationToken = uuidv4()
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)
    user.verificationToken = verificationToken
    user.verificationTokenExpiry = verificationTokenExpiry
    await user.save()
    addToWelcomeEmailQueue(user._id, user.name, user.email, verificationToken)
}

export default generateToken