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

router.post('/setwinner/:prompt_id/:user_id/:story_id', adminRestricted, async (req, res) => {
  const { prompt_id, user_id, story_id } = req.params;
  const winner = await admin.setWinner(story_id, user_id, prompt_id);
  if (winner) {
    return res.status(200).json({ message: `Story with ID ${story_id} and prompt ${prompt_id} from User ID ${user_id} was set as a winner.` })
  } else {
    return res.status(500).json({ error: "Something went wrong." })
  }
})

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