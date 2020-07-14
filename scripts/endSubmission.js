const CronJob = require('cron').CronJob;
const story = require("./storyModel.js");

const job = new CronJob('00 00 15 * * *', async function() {
    const prompt = await story.getPrompt();

    if (prompt.length === 0) {
        console.log('No prompt');
    } else {
       await story.editPrompt(prompt.id, { active: false, topThree: true });
    }
})

job.start();