const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
// const multer = require('multer');
// const newUpload = multer();
const bodyParser = require("body-parser");

const emailRouter = require("../email/emailRouter.js");
const storyRouter = require("../story/storyRouter.js");
const upvoteRouter = require("../upvote/upvoteRouter.js");

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

server.use("/email", emailRouter);
server.use("/upload", restricted, storyRouter);
server.use("/upvote", restricted, upvoteRouter);

module.exports = server;
