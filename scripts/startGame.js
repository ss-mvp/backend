const CronJob = require('cron').CronJob;
const story = require("../api/story/storyModel.js");

// const job = new CronJob('00 30 22 * * *', async function() {
const job = new CronJob('00 56 16 * * *', async function() {
    // Start daily game
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

job.start();

module.exports = job;