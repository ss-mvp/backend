const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
// const multer = require('multer');
// const newUpload = multer();

const forceHttps = require('@crystallize/elasticloadbalancer-express-force-https');

const bodyParser = require("body-parser");

const emailRouter = require("../api/email/emailRouter.js");
const storyRouter = require("../api/story/storyRouter.js");
const rankingRouter = require("./ranking/rankingRouter.js");
const adminRouter = require("../api/admin/adminRouter.js");
const restricted = require("./middleware/restricted");


// cron code start

const CronJob = require('cron').CronJob;
const story = require("../api/story/storyModel.js");

async function getRandom() {
  let ids = [];
  const prompts = await story.allPrompts();
  prompts.map(element => {
      ids.push(element.id);
  })
  random_prompt = ids[Math.floor(Math.random() * (ids.length - 1))];
  return random_prompt
}

if(Date.now() < 1599156959912){
  let start = async function() {
    // Start daily game
    console.log('start game')
    const prompt = await story.getPrompt();
    let ht = {}
    let rand = await getRandom();

    if (!prompt || prompt.length === 0 || prompt.length === 30) {
        await story.wipeQueue();
        // Choose new prompt
        // const rando = await getRandom();
        await story.addToQueue(rand);
        await story.editPrompt(rand, { active: true });
    } else {
        let queue = await story.getQueue();
        queue = queue.queue.split(',');
        queue.map(el => {
          ht[el] = true
        })
        while (true) {
          if (rand in ht) {
            rand = getRandom();
          }
          else {
            break
          }
        }
        // console.log(typeof rand)
        story.addToQueue(rand)
        .then(response => {
          console.log(response)
        })
        .catch(err => console.log(err))
        // Set prompt to active
        await story.editPrompt(rand, { active: true });
    }

    await story.setTime(rand);
}
start()
}

// const job = new CronJob('00 30 02 * * *', async function() {
const startGame = new CronJob('00 11 14 * * *', async function() {
    // Start daily game
    console.log('start game')
    const prompt = await story.getPrompt();
    let ht = {}
    let rand = await getRandom();

    if (!prompt || prompt.length === 0 || prompt.length === 30) {
        await story.wipeQueue();
        // Choose new prompt
        // const rando = await getRandom();
        await story.addToQueue(rand);
        await story.editPrompt(rand, { active: true });
    } else {
        let queue = await story.getQueue();
        queue = queue.queue.split(',');
        queue.map(el => {
          ht[el] = true
        })
        while (true) {
          if (rand in ht) {
            rand = getRandom();
          }
          else {
            break
          }
        }
        // console.log(typeof rand)
        story.addToQueue(rand)
        .then(response => {
          console.log(response)
        })
        .catch(err => console.log(err))
        // Set prompt to active
        await story.editPrompt(rand, { active: true });
    }

    await story.setTime(rand);
})

// const endSubmission = new CronJob('00 00 19 * * *', async function() {
const endSubmission = new CronJob('00 00 19 * * *', async function() {
  const prompt = await story.getPrompt();
  console.log('end submission')
  if (!prompt || prompt.length === 0) {
      console.log('No prompt');
  } else {
     await story.editPrompt(prompt.id, { active: false, topThree: true });
     const promptId = prompt.id;
    //  const times = await story.getTime(promptId);
  }
})

// const startVoting = new CronJob('00 30 19 * * *', async function() {
  const startVoting = new CronJob('00 30 19 * * *', async function() {
    const prompt = await story.getPrompt();
    console.log('start vote')
    if (!prompt || prompt.length === 0) {
        console.log('No prompt');
    } else {
       await story.editPrompt(prompt.id, { topThree: false, voting: true });
    }
  })

// const endVoting = new CronJob('00 00 22 * * *', async function() {
  const endVoting = new CronJob('00 00 22 * * *', async function() {
    const prompt = await story.getPrompt();
    console.log('end vote')
    if (!prompt || prompt.length === 0) {
        console.log('No prompt');
    } else {
       await story.editPrompt(prompt.id, { voting: false })
    }
  })

endSubmission.start();
endVoting.start();
startVoting.start();
startGame.start();

// cron code end



const server = express();





server.use(helmet());
// server.use(cors());
if(process.env.BE_ENV === 'development'){
  server.use(cors());
}else {

  server.use(function(req, res, next) {
    // const origins = ['https://condescending-edison-aa86dd.netlify.app', 'https://goofy-shirley-2a2ca3.netlify.app']
    // const origin = req.headers.origin
  
    // if (origins.indexOf(origin) > -1) {
    //   res.setHeader("Access-Control-Allow-Origin", origin)
    // }
    res.header("Access-Control-Allow-Origin", "*");
    // res.header("Access-Control-Allow-Origin", "https://goofy-shirley-2a2ca3.netlify.app"); // update to match the domain you will make the request from
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
    res.header('Access-Control-Allow-Credentials', true);
    next();
  });
}

server.use(bodyParser.urlencoded({ extended: false, limit: "50mb" }));
server.use(bodyParser.json({ limit: "50mb" }));
// server.use(newUpload.array());

server.use("/email", emailRouter);
server.use("/upload", storyRouter);
server.use("/admin", adminRouter);
server.use("/ranking", rankingRouter)

module.exports = server;
