const db = require("../../data/dbConfig.js");

module.exports = { getLeaderboard };

// This function sends a list of the top ten scores to the front end to be displayed in the leaderboard. 

async function getLeaderboard() 
{
    return await db("submissions as s")
        .join("users as u", "u.id", "s.userId")
        .select("u.id", "username")
        .sum("s.score as score")
        .groupBy("u.id")
        .orderBy("score", "desc")
        .limit(10)
}