import Article from '../models/article.model.js'
import { CATEGORIES } from '../utils/constants.js'

const BASE_URL = 'https://newsdata.io/api/1/news'
const API_KEY = process.env.NEWSDATA_API_KEY


const fetchNewsByCategory = async (category) => {
  try {
    const response = await fetch(
      `${BASE_URL}?apikey=${API_KEY}&category=${category}&language=en`
    )

    if (!response.ok) {
      console.error(`Failed to fetch ${category} news: ${response.statusText}`)
      return []
    }

    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error(`Error fetching ${category} news:`, error.message)
    return []
  }
}

const saveArticles = async (articles, category) => {
  let saved = 0
  let skipped = 0

  for (const article of articles) {
    // Skip articles without title or url
    if (!article.title || !article.link) {
      skipped++
      continue
    }

   try {
    
      await Article.findOneAndUpdate(
        { url: article.link },
        {
          $set: {
            title: article.title,
            description: article.description || null,
            url: article.link,
            image: article.image_url || null,
            category,
            source: article.source_id || null,
            publishedAt: article.pubDate ? new Date(article.pubDate) : null,
            fetchedAt: new Date(),
          },
        },  { upsert: true, returnDocument: 'after' } 
      )
      saved++
    } catch (error) {
      // Skip duplicate slug errors
      if (error.code === 11000) {
        skipped++
        continue
      }
      console.error(`Error saving article:`, error.message)
    }
  }

  console.log(`${category}: saved ${saved}, skipped ${skipped}`)
}

export const fetchAndSaveNews = async () => {
  console.log('Starting daily news fetch... 🗞️')

  for (const category of CATEGORIES) {
    const articles = await fetchNewsByCategory(category)
    await saveArticles(articles, category)
  }

  console.log('Daily news fetch complete ✅')
}