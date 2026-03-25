import mongoose from "mongoose";
import { CATEGORIES, DIGEST_FREQUENCY } from "../utils/constants.js";

const {Schema, model, models} = mongoose

const userSchema = new  Schema({
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    status: {
      type: String,
      enum: ['unverified', 'active', 'inactive'],
      default: 'unverified',
    },
    verificationToken: {
      type: String,
      default: null,
    },
    verificationTokenExpiry: {
      type: Date,
    },
    categories: {
      type: [String],
      enum: CATEGORIES,
      default: ['technology'],
    },
    digestFrequency: {
      type: Number,
     min: DIGEST_FREQUENCY.MIN,
    max: DIGEST_FREQUENCY.MAX,
    default: DIGEST_FREQUENCY.DEFAULT,
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
    lastNotifiedAt: {
      type: Date,
      default: null,
    },
}, { timestamps: true}
)
userSchema.index({ status: 1, lastNotifiedAt: 1, digestFrequency: 1 })
  
const User = models?.User || model('User', userSchema)

export default User