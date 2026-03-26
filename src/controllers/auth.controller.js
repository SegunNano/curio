import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from 'uuid'
import validator from "validator"
import generateToken from "../utils/generateToken.js"
import { addToWelcomeEmailQueue } from "../queues/queue.js"
import redis from "../config/redis.js"
import { recreateToken } from "../utils/generateToken.js"


export const signup = async (req, res) => {

  try {
    const { name, email, password, categories, digestFrequency } = req.body
    
    if (!validator.isEmail(email)) {
      req.flash('error', 'Invalid email address')
      return res.redirect('/auth?type=signup')
    }
    
    const existingUser = await User.findOne({ email })
    if (existingUser) {
        req.flash('error', 'Email already registered')
        return res.redirect('/auth?type=login')
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const verificationToken = uuidv4()
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)
    
    
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        categories: categories || ['technology'],
        digestFrequency: digestFrequency || 3,
        lastActiveAt: new Date(),
        verificationToken,
        verificationTokenExpiry
    })
    
    generateToken(res, user._id)
    addToWelcomeEmailQueue(user._id, user.name, user.email, user.verificationToken)
    
    req.flash('success', 'Account created! Please check your email to verify your account.')
    res.redirect('/news')
} catch (error) {
    console.error('Signup error:', error.message)
    req.flash('error', 'Something went wrong, please try again')
        res.redirect('/auth?type=signup')
    }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body
        
    // Validate email format
     if (!validator.isEmail(email)) {
      req.flash('error', 'Invalid email address')
      return res.redirect('/auth?type=login')
    }
        
    // Check if user exists
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      req.flash('error', 'Invalid email or password')
      return res.redirect('/auth?type=login')
    }
     
  
   // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      req.flash('error', 'Invalid email or password')
      return res.redirect('/auth?type=login')
    }

    const cachedUser= await redis.get(`user:${user._id}`)
    if ( cachedUser) await redis.del(`user:${req.user._id}`)
   // Check if user is verified
    if (user.status === 'unverified') {
      // Check if token still valid, if not generate new one
      const tokenStillValid = user.verificationTokenExpiry > new Date()
         
      if (tokenStillValid) {
      addToWelcomeEmailQueue(user._id, user.name, user.email, user.verificationToken)
      } else {
        await recreateToken(user)
      }
   // Generate token
    generateToken(res, user._id)
// Check if there's a saved redirect
const redirectUrl = req.session.returnTo || '/news'
    // req.flash('error', `Welcome back ${user.name}!, Please verify your email. A new verification link has been sent.`)
     return res.redirect(redirectUrl)
    }
    // Check if user is inactive
    if (user.status === 'inactive') {
      user.status = 'active'
      user.lastActiveAt = new Date()
     await user.save()
     }
   // Generate token
    generateToken(res, user._id)
    // Check if there's a saved redirect
const redirectUrl = req.session.returnTo || '/news'
delete req.session.returnTo // clean up
 req.flash('success', `Welcome back ${user.name}! 🎉`)
    res.redirect(redirectUrl)
  } catch (error) {
    console.error('Login error:', error.message)
    req.flash('error', 'Something went wrong, please try again')
    res.redirect('/auth?type=login')
  }
}
export const logout = async (req, res) => {
  try {
    // Delete user from Redis cache
    if (req.user) {
      await redis.del(`user:${req.user._id}`)
    }

    // Clear cookie
    res.clearCookie('token')

    req.flash('success', 'Logged out successfully')
    res.redirect('/auth?type=login')
  } catch (error) {
    console.error('Logout error:', error.message)
    res.redirect('/')
  }
}


export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() },
    })

    if (!user) {
      req.flash('error', 'Invalid or expired verification link')
      return res.redirect('/auth?type=signup')
    }

    user.status = 'active'
    user.verificationToken = null
    user.verificationTokenExpiry = null
    await user.save()

    generateToken(res, user._id)
    req.flash('success', 'Email verified successfully! Welcome to Curio 🎉')
    res.redirect('/news')
  } catch (error) {
    console.error('Verification error:', error.message)
    req.flash('error', 'Something went wrong, please try again')
    res.redirect('/auth?type=signup')
  }
}

export const resendVerification = async (req, res) => {
  if (!req.user) return res.redirect('/auth?type=login')

  try {
    const user = await User.findById(req.user._id)

    if (user.status === 'active') {
      req.flash('info', 'Your email is already verified')
      return res.redirect('/news')
    }

    const tokenStillValid = user.verificationTokenExpiry > new Date()

    if (tokenStillValid) {
      addToWelcomeEmailQueue(user._id, user.name, user.email, user.verificationToken)
    } else {
     await recreateToken(user)
    }

    req.flash('success', 'Verification email resent successfully')
    res.redirect('/news')
  } catch (error) {
    console.error('Resend verification error:', error.message)
    req.flash('error', 'Something went wrong, please try again')
    res.redirect('/news')
  }
}