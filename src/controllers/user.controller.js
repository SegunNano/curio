import User from '../models/user.model.js'
import redis from '../config/redis.js'
import { CATEGORIES, DIGEST_FREQUENCY } from '../utils/constants.js'


export const updateProfile = async (req, res) => {
  try {
    let { name, categories } = req.body
    const digestFrequency = req.body.digestFrequency
      ? Number(req.body.digestFrequency)
      : null

    const user = await User.findById(req.user._id)

    // Update name
    if (name) user.name = name

    // Normalize categories
    if (categories && typeof categories === 'string') {
      categories = [categories]
    }

    // Validate categories
    if (categories) {
      const invalid = categories.filter(c => !CATEGORIES.includes(c))
      if (invalid.length > 0) {
        req.flash('error', `Invalid categories: ${invalid.join(', ')}`)
        return res.redirect('/user/profile')
      }
      user.categories = categories
    }

    // Validate digest frequency
    if (digestFrequency) {
      if (digestFrequency < DIGEST_FREQUENCY.MIN || digestFrequency > DIGEST_FREQUENCY.MAX) {
        req.flash('error', `Digest frequency must be between ${DIGEST_FREQUENCY.MIN} and ${DIGEST_FREQUENCY.MAX} days`)
        return res.redirect('/user/profile')
      }
      user.digestFrequency = digestFrequency
    }

    await user.save()

    // Clear Redis cache
    await redis.del(`user:${req.user._id}`)

    req.flash('success', 'Profile updated successfully')
    res.redirect('/user/profile')
  } catch (error) {
    console.error('Update profile error:', error.message)
    req.flash('error', 'Something went wrong')
    res.redirect('/user/profile')
  }
}

export const getDashboard = async (req, res) => {
  try {
    const user = req.user

    res.render('user/index', {
      user,
      categories: CATEGORIES,
      digestFrequency: DIGEST_FREQUENCY,
    })
  } catch (error) {
    console.error('Dashboard error:', error.message)
    req.flash('error', 'Something went wrong')
    res.redirect('/')
  }
}

export const getProfile = async (req, res) => {
  try {
    res.render('user/profile', {
      user: req.user,
      categories: CATEGORIES
    })
  } catch (error) {
    console.error('Profile error:', error.message)
    req.flash('error', 'Something went wrong')
    res.redirect('/')
  }
}