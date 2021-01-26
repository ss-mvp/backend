const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

const forceHttps = require("@crystallize/elasticloadbalancer-express-force-https");

const bodyParser = require("body-parser");

const emailRouter = require("../api/email/emailRouter.js");
const storyRouter = require("../api/story/storyRouter.js");
const rankingRouter = require("./ranking/rankingRouter.js");
const adminRouter = require("../api/admin/adminRouter.js");
const leaderBoardRouter = require("./leaderboard/leaderboardRouter.js");

const CronJob = require("cron").CronJob;
const story = require("../api/story/storyModel.js");
const ranking = require("../api/ranking/rankingModel");

const startGame = new CronJob(
    "00 30 20 * * *",
    async function () 
    {
        // Clear previous games data
        await story.disableAll();

        //Set the current active prompt to false
        if ((await story.nextPrompt()) === -1) 
        {
            //Big error.
            console.log("Start game failure");
        }
    },
    null,
    true,
    "America/New_York"
);

const endSubmission = new CronJob(
    "00 00 17 * * *",
    async function () 
    {
        const prompt = await story.getPrompt();

        await story.clearRanking();

        if (!prompt || prompt.length === 0) 
        {
            console.log("No prompt");
        }
        else 
        {
            await story.editPrompt(prompt.id, { active: false, topThree: true });
        }
    },
    null,
    true,
    "America/New_York"
);

const startVoting = new CronJob(
    "00 30 17 * * *",
    async function () 
    {
        const prompt = await story.getPrompt();
        console.log("start vote");
        if (!prompt || prompt.length === 0) 
        {
            console.log("No prompt");
        }
        else 
        {
            await story.editPrompt(prompt.id, { topThree: false, voting: true });
        }
    },
    null,
    true,
    "America/New_York"
);

const endVoting = new CronJob(
    "00 00 20 * * *",
    async function () 
    {
        const prompt = await story.getPrompt();
        console.log("end vote");
        if (!prompt || prompt.length === 0) 
        {
            console.log("No prompt");
        }
        else 
        {
            await story.editPrompt(prompt.id, { voting: false });

            // AddWinner will add a winning submission to the winning_stories table
            await ranking.addWinner();
        }
    },
    null,
    true,
    "America/New_York"
);


endSubmission.start();
endVoting.start();
startVoting.start();
startGame.start();

const server = express();

server.use(helmet());
server.use(
    cors({
        origin: function (origin, callback) 
        {
            if (process.env.BE_ENV === "development" || !origin) 
            {
                callback(null, true);
                return;
            }

            if (
                origin === "https://contest.storysquad.app" ||
                origin === "https://adminconteststorysquad.netlify.app" ||
                origin === "https://server.storysquad.app" ||
                origin === "https://fdsc-production.netlify.app" ||
                origin === "https://fdsc-frontend-k05uv8tvq.vercel.app"
            )
                callback(null, true);
            else callback("Not allowed by CORS", false);
        },
        allowedHeaders: [
            "Origin",
            "X-Requested-With",
            "Content-Type",
            "Accept",
            "Authorization",
            "Content-Length"
        ],
        methods: ["POST", "GET", "OPTIONS", "PUT"]
    })
);

server.use(bodyParser.urlencoded({ extended: false, limit: "25mb" }));
server.use(bodyParser.json({ limit: "25mb" }));

server.use("/email", emailRouter);
server.use("/upload", storyRouter);
server.use("/admin", adminRouter);
server.use("/ranking", rankingRouter);
server.use("/leaderboard", leaderBoardRouter);

module.exports = server;
