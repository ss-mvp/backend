const db = require("../../data/dbConfig.js");

module.exports = { getLeaderboard };


// Time interval to sum top 10 with thee users past 7 submissions
const today = new Date();
const exp = new Date(today);
const useMe = exp.setDate(today.getDate() - 7)


// This function sends a list of the top ten scores to the front end to be displayed in the leaderboard. 
// We want to retrieve submissions that were submitted from today up to 7 days ago
async function getLeaderboard() 
{
    return await db("submissions as s")
        .join("users as u", "u.id", "s.userId")
        .select("u.id", "username")
        .where("s.image", ">", `${useMe}`)
        .sum("s.score as score")
        .groupBy("u.id")
        .orderBy("score", "desc")
        .limit(10)
}
