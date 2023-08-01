
const express = require('express');
const router = express.Router();
const sequelize = require('../dbConnections');





router.post('/:userId', async (req, res) => {
    const { userId } = req.params;
    const { address, city, state, postal_code, country, phone_number } = req.body;
  
    const query = 'INSERT INTO user_address (user_id, address, city, state, postal_code, country, phone_number) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const values = [userId, address, city, state, postal_code, country, phone_number];
  
    try {
      const [results] = await sequelize.query(query, {
        replacements: values,
        type: sequelize.QueryTypes.INSERT,
      });
  
      console.log('User address saved successfully');
      res.status(200).json({ message: 'User address saved successfully' });
    } catch (err) {
      console.error('Error saving user address: ', err);
      res.status(500).json({ error: 'Error saving user address' });
    }
  });
  
  



// Assuming you have the necessary imports and Sequelize setup

router.get('/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
      const query = `SELECT * FROM user_address WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`;
      const [results] = await sequelize.query(query, {
        replacements: [userId],
        type: sequelize.QueryTypes.SELECT,
      });
  
      if (!results || results.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.json(results);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  













  router.put('/:userId', async (req, res) => {
    const userId = req.params.userId;
    const { address, city, state, postal_code, country } = req.body;
  
    console.log(userId);
    try {
      // Check if the user's address already exists in the 'user_address' table
      const addressQuery = 'SELECT id FROM user_address WHERE user_id = ?';
      const [addressResults] = await sequelize.query(addressQuery, {
        replacements: [userId],
        type: sequelize.QueryTypes.SELECT,
      });
      console.log("hi" +addressResults);
      if (addressResults.length > 0) {
        // If the address exists, update it
        const addressUpdateQuery = `
          UPDATE user_address
          SET address = ?, city = ?, state = ?, postal_code = ?, country = ?
          WHERE user_id = ?;
        `;
  
        // Include all the parameters, even if they are empty or undefined
        const addressUpdateValues = [address || null, city || null, state || null, postal_code || null, country || null, userId];
        await sequelize.query(addressUpdateQuery, {
          replacements: addressUpdateValues,
          type: sequelize.QueryTypes.UPDATE,
        });
      } else {
        // If the address doesn't exist, insert a new row
        const addressInsertQuery = `
          INSERT INTO user_address (user_id, address, city, state, postal_code, country)
          VALUES (?, ?, ?, ?, ?, ?);
        `;
        const addressInsertValues = [userId, address || null, city || null, state || null, postal_code || null, country || null];
        await sequelize.query(addressInsertQuery, {
          replacements: addressInsertValues,
          type: sequelize.QueryTypes.INSERT,
        });
      }
  
      console.log('User address updated successfully');
      res.status(200).json({ message: 'User address updated successfully' });
    } catch (err) {
      console.error('Error updating user address: ', err);
      res.status(500).json({ error: 'Error updating user address' });
    }
  });
  
  
  







  
  module.exports = router;
