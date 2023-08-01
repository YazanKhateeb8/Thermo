const express = require('express');
const router = express.Router();
const categoryService = require('../services/categoryQueries');



router.get('/', async (req, res) => {
  
    try {
      const category = await categoryService.getAllCategories();
      res.send(category);
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'Internal server error' });
    }
  });


  module.exports = router;
