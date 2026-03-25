import mongoose from 'mongoose'
import { CATEGORIES } from '../utils/constants.js'

const { Schema, model, models } = mongoose

const articleSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: String,
      default: null,
    },
    category: {
      type: String,
      required: true,
      enum: CATEGORIES,
    },
    source: {
      type: String,
      default: null,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    fetchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

articleSchema.index({ category: 1, publishedAt: -1 })

// TTL index — auto delete after 7 days
articleSchema.index({ fetchedAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 })

const Article = models?.Article || model('Article', articleSchema)

export default Article