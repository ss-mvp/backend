const router = require('express').Router();
const admin = require('./adminModel.js');
// const adminRestricted = require();

router.get('/', adminRestricted, async (req, res) => {

    const submissions = await admin.getSubmissions();

    return res.json({ submissions });
})

router.post('/login', (req, res) => {
    if (req.username === 'admin' && req.password === 'GraigAdminAccount2020') {

    } else {
        return res.status(400).json({ error: 'Incorrect Username/Password' });
    }
})

function signToken(user) {
    const payload = {
      username: user.email,
      id: user.id
    }
  
    const options = {
      expiresIn: '1d'
    }
  
    return jwt.sign(payload, jwtSecret, options);
}

module.exports = router;