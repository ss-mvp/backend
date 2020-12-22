const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const jwtSecret = process.env.JWT_SECRET || 'sfwefsd9fdsf9sf9sf9sd8f9sdkfjkwekl23';

module.exports = (authRequired = true) => (req, res, next) => {
  if (req.headers && req.headers.authorization) {
    const token = req.headers.authorization;

    jwt.verify(token, jwtSecret, (err, decodedToken) => {
      if (err && authRequired) {
        console.log(err)
        return res.status(401).json({ error: "Token is not valid."})
      } else {
        if (decodedToken) {
          req.username = decodedToken.username;
          req.userId = decodedToken.id;
        }
        next();
      }
    })
  } else {
    return res.status(401).json({ error: "You need a user token to access this resource. Please login first." });
  }
};