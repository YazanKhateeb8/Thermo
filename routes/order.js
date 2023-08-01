// routes.js
const express = require('express');
const router = express.Router();
const sequelize = require('../dbConnections');

router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const query = `
      SELECT 
        o.order_id, 
        o.order_date,
        ua.address,
        ua.city,
        ua.state,
        ua.postal_code,
        ua.country,
        ua.phone_number,
        p.product_id,
        p.name AS product_name,
        p.price AS product_price,
        p.rating AS product_rating,
        p.quantity AS product_quantity,
        pi.image_url AS product_image_url,
        oi.item_id AS order_item_id, 
        oi.quantity AS order_item_quantity, 
        oi.price AS order_item_price
      FROM orders o
      JOIN order_items oi ON o.order_id = oi.order_id
      JOIN products p ON oi.product_id = p.product_id
      JOIN product_images pi ON p.product_id = pi.product_id
      JOIN user_address ua ON o.address_id = ua.id -- Join the user_address table
      WHERE o.user_id = :userId
      GROUP BY o.order_id, p.product_id, oi.item_id;
    `;

    const ordersWithItems = await sequelize.query(query, {
      replacements: { userId },
      type: sequelize.QueryTypes.SELECT,
    });

    const userOrders = [];
    const orderMap = new Map();

    ordersWithItems.forEach((row) => {
      const {
        order_id,
        order_date,
        address,
        city,
        state,
        postal_code,
        country,
        phone_number,
        product_id,
        product_name,
        product_price,
        product_rating,
        product_quantity,
        product_image_url,
        order_item_id,
        order_item_quantity,
        order_item_price,
      } = row;

      if (!orderMap.has(order_id)) {
        orderMap.set(order_id, {
          order_id,
          order_date,
          address: {  // Add the address object to the order
            address,
            city,
            state,
            postal_code,
            country,
            phone_number,
          },
          items: [],
        });
        userOrders.push(orderMap.get(order_id));
      }

      const orderItem = {
        item_id: order_item_id,
        quantity: order_item_quantity,
        price: order_item_price,
        product: {
          product_id,
          product_name,
          product_price,
          product_rating,
          product_quantity,
          product_image_url,
        },
      };
      orderMap.get(order_id).items.push(orderItem);
    });

    res.json(userOrders);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Unable to fetch orders and order items' });
  }
});

module.exports = router;
