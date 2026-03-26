import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import redis from '../config/redis.js'; 


  export const isAuthenticated = async (req, res, next) => {

    try {
      const token = req.cookies.token
          if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

              // Check Redis cache first
        const cachedUser = await redis.get(`user:${decoded.userId}`)
        
        if (cachedUser) {
              req.user = JSON.parse(cachedUser) // ✅ no DB query
        } else {
           req.user = await User.findByIdAndUpdate(
            decoded.userId,
            { $set: { lastActiveAt: new Date() } },
           { returnDocument: after }
          )
              // Cache for 5 minutes
          await redis.set(`user:${decoded.userId}`, JSON.stringify(req.user), 'EX', 300)
        }
      }
    } catch (error) {
      req.user = null
    }
    next()
  }

  export const isLoggedIn = (req, res, next) => {
  if (req.user) return next()
 req.session.returnTo = req.originalUrl
  req.flash('error', 'You must be logged in')
  res.redirect('/auth?type=login')
}