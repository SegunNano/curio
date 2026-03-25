import { Router } from 'express'
import { getDashboard, getProfile, updateProfile } from '../controllers/user.controller.js'


const router = Router()

router.get('/', getDashboard)
router.get('/profile', getProfile)
router.post('/profile', updateProfile)

export default router