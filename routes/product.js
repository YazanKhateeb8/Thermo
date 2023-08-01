const express = require('express');
const router = express.Router();
const productService = require('../services/productsQueries');
const sequelize = require('../dbConnections');



router.get('/products', async (req, res) => {
  try {
    const categoryName = req.query.category;
    let products;

    if (categoryName) {
      products = await productService.getAllProductsByCategory(categoryName);
    } else {
      products = await productService.getAllProducts();
    }

    res.status(200).send(products);
  } catch (error) {
    // Handle the error appropriately
    res.status(500).send({ error: 'An error occurred while retrieving products' });
  }
});

router.get('/products/most-sold', async (req, res) => {

  try {
    const product = await productService.getMostSoldProducts();
    res.send(product);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Internal server error' });
  }
  });
  

  router.get('/products/discounted', async (req, res) => {

    try {
      const product = await productService.getProductsWithDiscount();
      res.send(product);
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'Internal server error' });
    }
    });



  router.get('/:productId', async (req, res) => {
    const productId = req.params.productId;
  
    try {
      const product = await productService.getProductById(productId);
      res.send(product);
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'Internal server error' });
    }
  });




  






  


  

  
  

module.exports = router;
