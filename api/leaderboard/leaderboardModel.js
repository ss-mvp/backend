const db = require("../../data/dbConfig.js");

module.exports = { getLeaderboard };

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