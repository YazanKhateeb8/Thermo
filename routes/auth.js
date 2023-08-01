const dotenv = require('dotenv');
dotenv.config();
const express = require("express");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sequelize = require('../dbConnections');
const router = express.Router();
const isLoggedIn = require("../auth-route-handlers");
const { QueryTypes } = require('sequelize');



router.post('/signup', async (req, res) => {
  const { firstName, lastName, email, password, picture, phoneNumber } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 12);

    // Check if the user already exists
    const existingUser = await sequelize.query('SELECT * FROM users WHERE email = ?', {
      replacements: [email],
      type: sequelize.QueryTypes.SELECT
    });

    if (existingUser.length > 0) {
      return res.status(400).send({ message: "User already exists." });
    }

    // Insert the new user into the database
    const newUser = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: hashedPassword,
      picture: picture || null,
      phoneNumber: phoneNumber
    };
    console.log(newUser);

    const result = await sequelize.query('INSERT INTO users SET firstName = ?, lastName = ?, email = ?, password = ?, picture = ?, phoneNumber = ?', {
      replacements: [newUser.firstName, newUser.lastName, newUser.email, newUser.password, newUser.picture, newUser.phoneNumber],
      type: sequelize.QueryTypes.INSERT
    });
    console.log(result);
    

    const token = jwt.sign({ email: email, id: result[0] }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.send({ result: newUser, token });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Something Went Wrong" });
  }
});


  
//     {
//     "firstName" : "yazan",
//     "lastName" : "khateeb",
//     "email" : "yazankhateeb1999@gmail.com",
//     "password" : "123456",
//     "picture" : null,
//     "phoneNumber" : "0558871603"
// }
  
  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
  
      // Check if the user exists in the database
      const results = await sequelize.query('SELECT * FROM users WHERE email = :email', {
        replacements: { email },
        type: sequelize.QueryTypes.SELECT,
      });
  
      if (results.length === 0) {
        return res.status(404).send({ message: "User doesn't exist." });
      }
  
      const existingUser = results[0];
  
      // Compare the provided password with the hashed password from the database
      const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
      if (!isPasswordCorrect) {
        return res.status(400).send({ message: "Invalid credentials" });
      }
  
      // Generate JWT token
      const token = jwt.sign({ email: existingUser.email, id: existingUser.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
      res.send({ result: existingUser, token });
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Something Went Wrong" });
    }
  });
  







  // router.get("/user", isLoggedIn, async (req, res) => {
  //   const authHeader = req.headers['authorization'];
  //   const token = authHeader && authHeader.split(' ')[1];
  //   if (!token) {
  //     return res.status(400).send({ message: "Token Is Missing" });
  //   }
  
  //   const decodedData = jwt.decode(token, process.env.JWT_SECRET);
  
  //   try {
  //     // Fetch all users from the database
  //     const users = await sequelize.query('SELECT * FROM users', { type: QueryTypes.SELECT });
  
  //     if (users.length === 0) {
  //       return res.status(404).send({ message: "No users found" });
  //     }
  
  //     res.send(users);
  //   } catch (error) {
  //     console.log(error);
  //     res.status(500).send({ message: "Something Went Wrong" });
  //   }
  // });
  


  router.get("/user", isLoggedIn, async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      return res.status(400).send({ message: "Token Is Missing" });
    }
  
    const decodedData = jwt.decode(token, process.env.JWT_SECRET);
  
    try {
      // Execute the sequelize.query to fetch user document
      const [userDocument] = await sequelize.query('SELECT * FROM users WHERE email = :email', {
        replacements: { email: decodedData.email },
        type: sequelize.QueryTypes.SELECT
      });
  
      if (!userDocument) {
        return res.status(404).send({ message: "User not found" });
      }
  
      res.send(userDocument);
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Something went wrong" });
    }
  });





  router.put('/:userId', async (req, res) => {
    const userId = req.params.userId;
    const { firstName, lastName, email, password, phoneNumber } = req.body;
  
    try {
      // Hash the password before updating the user details
      const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
  
      // Update user details (firstName, lastName, email, password, phoneNumber) in the 'users' table
      const userUpdateQuery = `
        UPDATE users
        SET firstName = ?, lastName = ?, email = ?, password = ?, phoneNumber = ?
        WHERE id = ?;
      `;
      const userUpdateValues = [firstName || null, lastName || null, email || null, hashedPassword, phoneNumber || null, userId];
      await sequelize.query(userUpdateQuery, {
        replacements: userUpdateValues,
        type: sequelize.QueryTypes.UPDATE,
      });
  
      console.log('User details updated successfully');
      res.status(200).json({ message: 'User details updated successfully' });
    } catch (err) {
      console.error('Error updating user details: ', err);
      res.status(500).json({ error: 'Error updating user details' });
    }
  });
  
  
  





// router.get("/user", isLoggedIn, async (req, res) => {
//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1];
//     if (!token) {
//       return res.status(400).send({ message: "Token Is Missing" });
//     }
  
//     const decodedData = jwt.decode(token, process.env.JWT_SECRET);
  
//     // Fetch the user from the database using the decoded user ID
//     pool.query('SELECT * FROM users WHERE id = ?', [decodedData.id], (error, results) => {
//       if (error) {
//         console.log(error);
//         return res.status(500).send({ message: "Something Went Wrong" });
//       }
  
//       if (results.length === 0) {
//         return res.status(404).send({ message: "User not found" });
//       }
  
//       const user = results[0];
//       res.send(user);
//     });
//   });
  



// router.post('/signup', async (req, res) => {
//   const isAdminQuery = req.query.isAdmin;
//   const { firstName, lastName, email, password, picture, phoneNumber } = req.body;
//   try {
//     const hashedPassword = await bcrypt.hash(password, 12);
//     let result ;

//     if (isAdminQuery === 'false') {
//       const existingUserQuery = 'SELECT * FROM users WHERE email = ?';
//       const [existingUserRows] = await pool.execute(existingUserQuery, [email]);
//       if (existingUserRows.length > 0) {
//         return res.status(400).send({ message: "User already exists." });
//       }
      
//       const createUserQuery = 'INSERT INTO users (firstName, lastName, email, password, picture, phoneNumber) VALUES (?, ?, ?, ?, ?, ?)';
//       const [createUserResult] = await pool.execute(createUserQuery, [firstName, lastName, email, hashedPassword, picture, phoneNumber]);
//       result = createUserResult.insertId;
//     }

//     const token = jwt.sign({ email, id: result }, process.env.JWT_SECRET, { expiresIn: "1h" });
//     res.send({ result, token });
//   } catch (err) {
//     console.log(err);
//     res.status(500).send({ message: "Something went wrong." });
//   }
// });


module.exports = router;
