const dotenv = require('dotenv');
dotenv.config();
const jwt = require("jsonwebtoken");

const payload = {
    iss: process.env.API_KEY,
    exp: ((new Date()).getTime() + 5000)
};
const token = jwt.sign(payload, process.env.API_SECRET);

function addToken(req, res, next) {
    req.body["token"] = token;
    next();
}

module.exports = { addToken }