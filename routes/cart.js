const express = require('express');
const router = express.Router();
const sequelize = require('../dbConnections');


router.get('/cart', async (req, res) => {
  const { user_id } = req.query;

  try {
    const cartQuery = `
      SELECT cart_items.*, products.name, products.price, products.rating, products.quantity AS product_quantity, products.sold, products.size, products.description, products.category_id
      FROM cart_items
      INNER JOIN products ON cart_items.product_id = products.product_id
      INNER JOIN cart ON cart_items.cart_id = cart.cart_id
      WHERE cart.user_id = :user_id;
    `;
    const cartItems = await sequelize.query(cartQuery, {
      replacements: { user_id },
      type: sequelize.QueryTypes.SELECT,
    });

    const cartItemsWithImages = await Promise.all(
      cartItems.map(async (item) => {
        const productId = item.product_id;
        const productQuery = `
          SELECT p.product_id, p.name, p.price, p.rating, p.quantity, p.sold, p.size, p.description, p.category_id
          FROM products p
          WHERE p.product_id = :productId;
        `;

        const imagesQuery = `
          SELECT pi.id, pi.image_url
          FROM product_images pi
          WHERE pi.product_id = :productId;
        `;

        const [productResult, imagesResult] = await Promise.all([
          sequelize.query(productQuery, {
            replacements: { productId },
            type: sequelize.QueryTypes.SELECT,
          }),
          sequelize.query(imagesQuery, {
            replacements: { productId },
            type: sequelize.QueryTypes.SELECT,
          }),
        ]);

        const product = productResult[0] || null;

        if (product) {
          product.images = imagesResult.map((row) => ({
            id: row.id,
            image_url: row.image_url,
          }));
        }

        return product;
      })
    );

    res.status(200).send(cartItemsWithImages);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Internal server error' });
  }
});

  



  router.get('/cart-items', async (req, res) => {
    const { user_id } = req.query;
  
    try {
      const cartItemsQuery = `
        SELECT cart_items.*, products.name, products.price, products.rating, products.quantity AS product_quantity, products.sold, products.size, products.description, products.category_id
        FROM cart_items
        INNER JOIN products ON cart_items.product_id = products.product_id
        INNER JOIN cart ON cart_items.cart_id = cart.cart_id
        WHERE cart.user_id = :user_id;
      `;
      const cartItems = await sequelize.query(cartItemsQuery, {
        replacements: { user_id },
        type: sequelize.QueryTypes.SELECT,
      });
  
      res.status(200).json(cartItems);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  

  
  
  


  router.post('/add-to-cart', async (req, res) => {
    const { user_id, product_id } = req.body;
  
    try {
      // Find the user's cart
      const cartIdQuery = `
        SELECT cart_id FROM cart
        WHERE user_id = :user_id;
      `;
      const [cartIdResult] = await sequelize.query(cartIdQuery, {
        replacements: { user_id },
        type: sequelize.QueryTypes.SELECT,
      });
  
      let cartId;
  
      if (!cartIdResult) {
        // Create a new cart for the user if it doesn't exist
        const createCartQuery = `
          INSERT INTO cart (user_id)
          VALUES (:user_id);
        `;
        await sequelize.query(createCartQuery, {
          replacements: { user_id },
          type: sequelize.QueryTypes.INSERT,
        });
  
        // Retrieve the cart_id of the newly created cart
        const [createdCart] = await sequelize.query(cartIdQuery, {
          replacements: { user_id },
          type: sequelize.QueryTypes.SELECT,
        });
  
        if (!createdCart) {
          throw new Error('Failed to create cart');
        }
  
        cartId = createdCart.cart_id;
      } else {
        cartId = cartIdResult.cart_id;
      }
  
      // Find the product to be added to the cart
      const productQuery = `
        SELECT * FROM products
        WHERE product_id = :product_id;
      `;
      const [product] = await sequelize.query(productQuery, {
        replacements: { product_id },
        type: sequelize.QueryTypes.SELECT,
      });
  
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
  
      // Check if the product already exists in the cart_items
      const existingProductQuery = `
        SELECT * FROM cart_items
        WHERE cart_id = :cart_id
        AND product_id = :product_id;
      `;
      const [existingProduct] = await sequelize.query(existingProductQuery, {
        replacements: { cart_id: cartId, product_id },
        type: sequelize.QueryTypes.SELECT,
      });
  
      if (existingProduct) {
        // If the product exists, update its quantity
        const updateQuantityQuery = `
          UPDATE cart_items
          SET quantity = quantity + 1
          WHERE cart_id = :cart_id
          AND product_id = :product_id;
        `;
        await sequelize.query(updateQuantityQuery, {
          replacements: { cart_id: cartId, product_id },
          type: sequelize.QueryTypes.UPDATE,
        });
      } else {
        // If the product doesn't exist, create a new cart item for the product in the cart
        const cartItemQuery = `
          INSERT INTO cart_items (cart_id, product_id, price, quantity)
          VALUES (:cart_id, :product_id, :price, 1);
        `;
        await sequelize.query(cartItemQuery, {
          replacements: {
            cart_id: cartId,
            product_id,
            price: product.price,
          },
          type: sequelize.QueryTypes.INSERT,
        });
      }
  
      res.status(200).json({ message: 'Product added to cart successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  
  






  router.delete('/remove-product', async function (req, res) {
    const { user_id, product_id } = req.body;
    console.log(user_id, product_id);
  
    try {
      // Find the user's cart
      const cartIdQuery = `
        SELECT cart_id FROM cart
        WHERE user_id = :user_id;
      `;
      const [cartIdResult] = await sequelize.query(cartIdQuery, {
        replacements: { user_id },
        type: sequelize.QueryTypes.SELECT,
      });
  
      if (!cartIdResult) {
        return res.status(404).json({ error: 'Cart not found' });
      }
  
      const cartId = cartIdResult.cart_id;
  
      // Check if the product exists in the cart
      const existingProductQuery = `
        SELECT * FROM cart_items
        WHERE cart_id = :cart_id
        AND product_id = :product_id;
      `;
      const [existingProduct] = await sequelize.query(existingProductQuery, {
        replacements: { cart_id: cartId, product_id },
        type: sequelize.QueryTypes.SELECT,
      });
  
      if (!existingProduct) {
        return res.status(404).json({ error: 'Product not found in the cart' });
      }
  
      // Delete the product from the cart
      const deleteProductQuery = `
        DELETE FROM cart_items
        WHERE cart_id = :cart_id
        AND product_id = :product_id;
      `;
      await sequelize.query(deleteProductQuery, {
        replacements: { cart_id: cartId, product_id },
        type: sequelize.QueryTypes.DELETE,
      });
  
      // Check if the cart is empty
      const cartItemsCountQuery = `
        SELECT COUNT(*) AS count FROM cart_items
        WHERE cart_id = :cart_id;
      `;
      const [cartItemsCount] = await sequelize.query(cartItemsCountQuery, {
        replacements: { cart_id: cartId },
        type: sequelize.QueryTypes.SELECT,
      });
  
      if (cartItemsCount && cartItemsCount.count === 0) {
        // Delete the cart if it's empty
        const deleteCartQuery = `
          DELETE FROM cart
          WHERE cart_id = :cart_id;
        `;
        await sequelize.query(deleteCartQuery, {
          replacements: { cart_id: cartId },
          type: sequelize.QueryTypes.DELETE,
        });
      }
  
      res.status(200).json({ message: 'Product deleted from cart successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  









  router.post('/check-out', async (req, res) => {
    const { user_id, address_id, total_amount } = req.body;
  
    try {
      // Find the user's cart
      const cartIdQuery = `
        SELECT cart_id FROM cart
        WHERE user_id = :user_id;
      `;
      const [cartIdResult] = await sequelize.query(cartIdQuery, {
        replacements: { user_id },
        type: sequelize.QueryTypes.SELECT,
      });
  
      if (!cartIdResult) {
        return res.status(404).json({ error: 'Cart not found' });
      }
  
      const cartId = cartIdResult.cart_id;
  
      // Create a new order
      const createOrderQuery = `
        INSERT INTO orders (user_id, address_id, total_amount)
        VALUES (:user_id, :address_id, :total_amount);
      `;
      await sequelize.query(createOrderQuery, {
        replacements: { user_id, address_id, total_amount },
        type: sequelize.QueryTypes.INSERT,
      });
  
      // Get the last inserted order_id
      const orderIdQuery = `
        SELECT LAST_INSERT_ID() AS order_id;
      `;
      const [orderIdResult] = await sequelize.query(orderIdQuery, {
        type: sequelize.QueryTypes.SELECT,
      });
      const orderId = orderIdResult.order_id;
  
      // Move cart items to the order
      const moveItemsQuery = `
        INSERT INTO order_items (order_id, product_id, price, quantity)
        SELECT :order_id, product_id, price, quantity
        FROM cart_items
        WHERE cart_id = :cart_id;
      `;
      await sequelize.query(moveItemsQuery, {
        replacements: { order_id: orderId, cart_id: cartId },
        type: sequelize.QueryTypes.INSERT,
      });
  
      // Clear the cart
      const clearCartQuery = `
        DELETE FROM cart_items
        WHERE cart_id = :cart_id;
      `;
      await sequelize.query(clearCartQuery, {
        replacements: { cart_id: cartId },
        type: sequelize.QueryTypes.DELETE,
      });
  
      res.status(200).json({ message: 'Cart checked out successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
















router.put('/update-product-quantity', async (req, res) => {
  const { user_id, product_id, quantity } = req.body;

  try {
   
    // Find the cart for the given user_id
    const cart = await sequelize.query('SELECT * FROM cart WHERE user_id = :user_id', {
      replacements: { user_id },
      type: sequelize.QueryTypes.SELECT,
    });

    if (cart.length === 0) {
      return res.status(404).json({ error: 'Cart not found for the user' });
    }

    // Update the quantity of the product in cart_items table
    const updateQuery = `
      UPDATE cart_items
      SET quantity = :quantity
      WHERE cart_id = :cart_id AND product_id = :product_id
    `;

    await sequelize.query(updateQuery, {
      replacements: { cart_id: cart[0].cart_id, product_id, quantity },
      type: sequelize.QueryTypes.UPDATE,
    });

    res.status(200).json({ message: 'Quantity updated successfully' });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});



module.exports = router;
