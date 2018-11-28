const express = require('express');
const router = express.Router();


//index route
router.get('/', (req,res) => {
  res.render('index/home',{
  });
})

//about route
router.get('/about', (req,res) => {
  res.render('index/about');
})

module.exports = router;
