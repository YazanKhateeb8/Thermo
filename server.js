const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const cors = require("cors");
const sequelize = require('./dbConnections');
const path = require('path');
const paypal = require('paypal-rest-sdk');


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


const authRoute = require("./routes/auth");
app.use("/auth", authRoute);

const productsRoute = require("./routes/product");
app.use("/product", productsRoute);

const categoriesRoute = require("./routes/category");
app.use("/category", categoriesRoute);


const cartRoute = require("./routes/cart");
app.use("/cart", cartRoute);

const userAddress = require("./routes/userAddress");
app.use("/address", userAddress);



const order = require("./routes/order");
app.use("/order", order);


  

sequelize
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    })







app.listen(process.env.PORT, () => console.log(`Running on port ${process.env.PORT}`))
