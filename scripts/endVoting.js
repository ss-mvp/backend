const CronJob = require('cron').CronJob;
const story = require("../api/story/storyModel.js");

const job = new CronJob('00 00 18 * * *', async function() {
    const prompt = await story.getPrompt();

    if (prompt.length === 0) {
        console.log('No prompt');
    } else {
       await story.editPrompt(prompt.id, { voting: false })
    }
})

job.start();

module.exports = job;