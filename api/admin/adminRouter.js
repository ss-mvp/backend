const router = require('express').Router();
const jwt = require('jsonwebtoken')
const story = require("../story/storyModel.js");
const admin = require('./adminModel.js');
const jwtSecret = process.env.JWT_SECRET || 'sfwefsd9fdsf9sf9sf9sd8f9sdkfjkwekl23';
const adminRestricted = require('../middleware/adminRestricted');

router.get('/', adminRestricted, async (req, res) => {

    const submissions = await admin.getSubmissions();
    // console.log(submissions)
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

router.post('/remove_user_data/:email', adminRestricted, async (req, res) => {
  const { email } = req.params;
  const removal = await admin.removeSubmissionsByEmail(email);
  if (removal > 0) {
    return res.status(200).json({ message: "Submissions removed" });
  } else {
    return res.status(200).json({ message: "There were no submissions" })
  }
})

router.post('/login', (req, res) => {
    if (req.body.username === process.env.ADMIN_USERNAME && req.body.password === process.env.ADMIN_PASSWORD) {
      const { username, password } = req.body;
      const user = {username, password}
      const token = signToken(user)
      return res.status(201).json({ token });
    } else {
        return res.status(400).json({ error: 'Incorrect Username/Password' });
    }
})

router.post('/setwinners/:prompt_id', adminRestricted, async (req, res) => {
  try {
    const { prompt_id } = req.params;
    const times = await story.getAllTimes(prompt_id);
    let prompt_time_id;
    const now = new Date().getTime();
    if (times.length > 0) {
      times.map(element => {
        if (element.time < now && element.end > now) {
          prompt_time_id = element.id
        }
      })
    }
    try {
      req.body.forEach(async (el) => {
        await admin.updateTopThree(parseInt(el.story_id))
      })
    } catch(err){
      return status(500).json({ message: `cannot update due to ${err}` })
    }
    try {
      req.body.forEach(async (el) => {
        await admin.setWinner({ ...el, prompt_id, prompt_time_id})
      });
    } catch(err){
      return status(500).json({ message: `cannot add top 3 due to ${err}` })
    }
    return res.status(200).json({ submissions: await admin.getSubmissionsPerTime(), users: await admin.getUsers()})

  } catch(err) {
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