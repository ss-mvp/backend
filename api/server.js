const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
// const multer = require('multer');
// const newUpload = multer();
const bodyParser = require("body-parser");
const startGame = require('../scripts/startGame.js');
const startVoting = require('../scripts/startVoting.js');
const endSubmission = require('../scripts/endSubmission.js');
const endVoting = require('../scripts/endVoting.js');

const emailRouter = require("../api/email/emailRouter.js");
const storyRouter = require("../api/story/storyRouter.js");
const upvoteRouter = require("../api/upvote/upvoteRouter.js");
const adminRouter = require("../api/admin/adminRouter.js");
const restricted = require("./middleware/restricted");

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
startGame();
startVoting();
endSubmission();
endVoting();

server.use("/email", emailRouter);
server.use("/upload", restricted, storyRouter);
server.use("/upvote", restricted, upvoteRouter);
server.use("/admin", adminRouter);

module.exports = server;
