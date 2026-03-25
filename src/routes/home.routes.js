import { Router } from "express";

const router = Router()

// Test route
router.get('/', (req,res)=>{
     if (req.user) return res.redirect('/news')
  res.render('landing')
})

export default router