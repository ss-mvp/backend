const db = require("../../data/dbConfig.js");

module.exports = { getLeaderboard };

// This function sends a list of the top ten scores to the front end to be displayed in the leaderboard. 

async function getLeaderboard() {
  return await db("submissions")
    .select("u.id", "image", "username")
    .sum("s.score as score")
    .from("submissions as s")
    .join("users as u", "u.id", "s.userId")
    .groupBy("u.id", "s.image")
    .orderBy("score", "desc")
    .limit(10);
}