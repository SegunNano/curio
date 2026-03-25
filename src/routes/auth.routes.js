import { Router } from "express"
import {   signup,   login,  logout, verifyEmail,  resendVerification } from "../controllers/auth.controller.js"
import { CATEGORIES } from "../utils/constants.js"


const router = Router()

// Public routes
// router.get('/signup', (req, res) => res.render('auth/form', { type: 'signup' }))
// router.get('/login', (req, res) => res.render('auth/form', { type: 'login' }))
router.get('/', (req, res) => {
  const type = req.query.type === 'login' ? 'login' : 'signup'
  res.render('auth/form', {
     type,
    categories: CATEGORIES
    })
})

router.get('/verify/:token', verifyEmail)

// Post routes
router.post('/signup', signup)
router.post('/login', login)
router.post('/logout', logout)

// Protected routes
router.get('/resend-verification', resendVerification)

export default router