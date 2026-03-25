import { Router } from 'express'
import { getNews, getNewsByCategory, readArticle } from '../controllers/news.controller.js'



const router = Router()

router.get('/', getNews)
router.get('/read', readArticle)
router.get('/:category',  getNewsByCategory)

export default router