const router = require('express').Router();
const jwt = require('jsonwebtoken')
const story = require("../story/storyRouter");
const admin = require('./adminModel.js');
const jwtSecret = process.env.JWT_SECRET || 'sfwefsd9fdsf9sf9sf9sd8f9sdkfjkwekl23';
const adminRestricted = require('../middleware/adminRestricted');

router.get('/', adminRestricted, async (req, res) => {

    const submissions = await admin.getSubmissions();

    return res.json({ submissions });
})

router.get('/users', adminRestricted, async (req, res) => {
    const users = await admin.getUsers();
    if (users) {
      return res.status(200).json({ users });
    } else {
      return res.status(400).json({ error: "Something went wrong." })
    }
})

router.get('/video', async (req, res) => {
  const video_id = await admin.getVideo();
  return res.json({ video_id });
})

router.post('/video', adminRestricted, async (req, res) => {

  function youtube_parser(url){
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match&&match[7].length==11)? match[7] : false;
  } 

  if (req.body.link) {
    const video_time = Date.parse(new Date());
    const sendPackage = {
      video_link: req.body.link,
      video_time: video_time,
      video_id: youtube_parser(req.body.link)
    }
    console.log(sendPackage)
    const addVideo = await admin.addVideo(sendPackage);
    if (addVideo) {
      return res.status(200).json({ message: "Video added." });
    } else {
      return res.status(400).json({ error: "Something went wrong adding video." })
    }
  } else {
    return res.status(400).json({ error: "This request must include a valid YouTube link." })
  }
})

router.get('/flag/:id', adminRestricted, async (req, res) => {
  const flag = await admin.getFlag(req.params.id);
  if (flag) {
    return res.status(200).json({ flag })
  } else {
    return res.status(500).json({ error: "Something went wrong." })
  }
})

router.post('/flag/:id', adminRestricted, async (req, res) => {
    
    const flagged = await admin.flagContent(req.params.id);
    console.log('flagged', flagged)
    if (flagged) {
      console.log(flagged)
      return res.status(200).json({ message: "Content flagged.", flag: 1 })
    } else {
      return res.status(200).json({ message: "Content unflagged.", flag: 0 })
    }
    
})

router.get('/winners', adminRestricted, async (req, res) => {
    const subs = await admin.getSubmissionsPerTime();
    return res.json({ subs });
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
  const times = await story.getAllTimes(prompt_id);
  let prompt_time_id;
  const now = new Date.getTime();
  if (times.length > 0) {
    times.map(element => {
      if (element.time < now && element.end > now) {
        prompt_time_id = element.id
      }
    })
  }
  const sendPackage = {
    story_id,
    user_id,
    prompt_id,
    prompt_time_id
  }
  const winner = await admin.setWinner(sendPackage);
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