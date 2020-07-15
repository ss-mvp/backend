const router = require('express').Router();
const jwt = require('jsonwebtoken')
const admin = require('./adminModel.js');
const jwtSecret = process.env.JWT_SECRET || 'sfwefsd9fdsf9sf9sf9sd8f9sdkfjkwekl23';
const adminRestricted = require('../middleware/adminRestricted');

router.get('/', adminRestricted, async (req, res) => {

    const submissions = await admin.getSubmissions();

    return res.json({ submissions });
})

router.post('/login', (req, res) => {
    if (req.body.username === 'admin' && req.body.password === 'GraigAdminAccount2020') {
      const { username, password } = req.body;
      const user = {username, password}
      const token = signToken(user)
      return res.status(201).json({ token });
    } else {
        return res.status(400).json({ error: 'Incorrect Username/Password' });
    }
})

// router.post()

function signToken(user) {
    const payload = {
      username: user.username,
      role: 'admin'
    }
  
    const options = {
      expiresIn: '1d'
    }
  
    return jwt.sign(payload, jwtSecret, options);
}

module.exports = router;