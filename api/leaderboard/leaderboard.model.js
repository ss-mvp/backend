const db = require("../../data/dbConfig.js");
const CronJob = require("cron").CronJob;

const getLeaderboard = () => {
    return db("leaderboard")
        .select("u.id", "image", "username")
        .sum('s.score as score')
        .from('submissions as s')
        .join('users as u', 'u.id', 's.userId')
        .groupBy('u.id', 's.image')
        .orderBy('score', 'desc');
};


module.exports = { getLeaderboard };