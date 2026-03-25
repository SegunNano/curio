import redis from '../config/redis.js'
import Article from '../models/article.model.js'

export const getNews = async (req, res) => {
  try {
    const { categories, _id } = req.user
    const allArticles = []

    for (const category of categories) {
      const cacheKey = `news:${category}`
      const cached = await redis.get(cacheKey)

      if (cached) {
        console.log(`${category} from cache 🟡`)
        allArticles.push(...JSON.parse(cached))
      } else {
        console.log(`${category} from DB 🟢`)
        const articles = await Article.find({ category })
          .sort({ publishedAt: -1 })
          .limit(20)

        // Cache category for 30 mins
        await redis.set(cacheKey, JSON.stringify(articles), 'EX', 30 * 60)
        allArticles.push(...articles)
      }
    }

    // Group by category
    const articlesByCategory = categories.reduce((acc, category) => {
      acc[category] = allArticles.filter(a => a.category === category)
      return acc
    }, {})

    res.render('news/index', { articles: allArticles, articlesByCategory })
  } catch (error) {
    console.error('News error:', error.message)
    req.flash('error', 'Something went wrong')
    res.redirect('/')
  }
}

export const getNewsByCategory = async (req, res) => {
  try {
    const { category } = req.params
    const page = Number(req.query.page) || 1
    const limit = 10

    // Check page cache
    const pageCacheKey = `news:${category}:page:${page}`
    const cachedPage = await redis.get(pageCacheKey)
    if (cachedPage) {
      console.log('Page from cache 🟡')
      return res.render('news/category', JSON.parse(cachedPage))
    }

    // Check category cache
    const categoryCacheKey = `news:${category}`
    const cachedCategory = await redis.get(categoryCacheKey)

    let articles
    let total

    if (cachedCategory) {
      // Slice from category cache
      console.log(`Slicing ${category} from cache 🟡`)
      const allArticles = JSON.parse(cachedCategory)
      total = allArticles.length
      articles = allArticles.slice((page - 1) * limit, page * limit)
    } else {
      // Fall back to DB
      console.log(`${category} from DB 🟢`)

        const allArticles = await Article.find({ category })
        .sort({ publishedAt: -1 })
        await redis.set(categoryCacheKey, JSON.stringify(allArticles), 'EX', 30 * 60)
       total = allArticles.length
       articles = allArticles.slice((page - 1) * limit, page * limit)
      }
      
      const data = {
      articles,
      category,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    }

    // Cache page for 5 mins
    await redis.set(pageCacheKey, JSON.stringify(data), 'EX', 5 * 60)

    res.render('news/category', data)
  } catch (error) {
    console.error('Category news error:', error.message)
    req.flash('error', 'Something went wrong')
    res.redirect('/news')
  }
}


export const readArticle = async (req, res) => {
  const { url } = req.query

  // Check if verified
  if (req.user.status === 'unverified') {
    req.flash('info', 'Please verify your email to read full articles 📧')
    return res.redirect('/news')
  }

  if (!url) return res.redirect('/news')
  res.redirect(url)
}