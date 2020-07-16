const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
// const multer = require('multer');
// const newUpload = multer();
const bodyParser = require("body-parser");
// const startGame = require('../scripts/startGame.js').job;
// const startVoting = require('../scripts/startVoting.js').job;
// const endSubmission = require('../scripts/endSubmission.js').job;
// const endVoting = require('../scripts/endVoting.js').job;

const emailRouter = require("../api/email/emailRouter.js");
const storyRouter = require("../api/story/storyRouter.js");
const upvoteRouter = require("../api/upvote/upvoteRouter.js");
const adminRouter = require("../api/admin/adminRouter.js");
const restricted = require("./middleware/restricted");

// cron code start

const CronJob = require('cron').CronJob;
const story = require("../api/story/storyModel.js");

// const job = new CronJob('00 30 22 * * *', async function() {
const startGame = new CronJob('00 35 18 * * *', async function() {
    // Start daily game
    console.log('start game')
    const prompt = await story.getPrompt();

    if (prompt.length === 0 || prompt.length === 30) {
        await story.wipeQueue();
        // Choose new prompt
        let ids = [];
        const prompts = await story.allPrompts();
        prompts.map(element => {
            ids.push(element.id);
        })
        random_prompt = ids[Math.floor(Math.random() * (ids.length - 1))];
        await story.addToQueue(random_prompt);
    } else {
        // Set prompt to active
        await story.editPrompt(true, prompt.id);
    }
})

const startVoting = new CronJob('00 30 15 * * *', async function() {
  const prompt = await story.getPrompt();

  if (prompt.length === 0) {
      console.log('No prompt');
  } else {
     await story.editPrompt(prompt.id, { topThree: false, voting: true });
  }
})

const endVoting = new CronJob('00 00 18 * * *', async function() {
  const prompt = await story.getPrompt();

  if (prompt.length === 0) {
      console.log('No prompt');
  } else {
     await story.editPrompt(prompt.id, { voting: false })
  }
})

const endSubmission = new CronJob('00 00 15 * * *', async function() {
  const prompt = await story.getPrompt();

  if (prompt.length === 0) {
      console.log('No prompt');
  } else {
     await story.editPrompt(prompt.id, { active: false, topThree: true });
  }
})

endSubmission.start();
endVoting.start();
startVoting.start();
startGame.start();

// cron code end

const server = express();
const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204 
  }

server.use(helmet());
server.use(cors(corsOptions));
server.use(bodyParser.urlencoded({ extended: false, limit: "50mb" }));
server.use(bodyParser.json({ limit: "50mb" }));
// server.use(newUpload.array());
startGame;
startVoting;
endSubmission;
endVoting;

server.use("/email", emailRouter);
server.use("/upload", restricted, storyRouter);
server.use("/upvote", restricted, upvoteRouter);
server.use("/admin", adminRouter);

module.exports = server;
