const db = require("../../data/dbConfig.js");
const moment = require("moment");

module.exports = {
    getTopThree,
    getFinalScores,
    addWinner,
    rankIt,
    addIP,
    getWinner,
    getVotes,
    getUser,
    getSubmission,
    getScoresByPromptID,
    getYesterdaysWinner
};

async function getTopThree() 
{
    return await db("topThree")
        .join("users", "topThree.user_id", "users.id")
        .join("submissions", "submissions.id", "topThree.story_id")
        .join("prompts", "prompts.id", "submissions.prompt_id")
        .orderBy("topThree.id", "desc")
        .limit(3)
        .select(
            "topThree.id as id",
            "submissions.userId",
            "users.username",
            "submissions.image",
            "submissions.rotation",
            "prompts.prompt"
        );
}

async function getVotes() 
{
    return await db("ranking");
}

async function getFinalScores() 
{
    //Return 3 ids

    const topThree = await db("topThree").orderBy("id", "desc").limit(3);
    //O(3)
    let allRanks = topThree.map(async (el) => 
    {
        let one = db("ranking").where({ topthree_id: el.id, rank: 1 });
        let two = db("ranking").where({ topthree_id: el.id, rank: 2 });
        let three = db("ranking").where({ topthree_id: el.id, rank: 3 });

        const allNums = await Promise.all([one, two, three]);
        let totalScore = 0;
        totalScore = allNums[0].length * 3 + allNums[1].length * 2 + allNums[2].length;

        return await db("topThree")
            .where({ id: el.id })
            .update({ score: totalScore });
    });

    await Promise.all(allRanks);

    return await db("topThree")
        .join("users", "topThree.user_id", "users.id")
        .join("submissions", "topThree.story_id", "submissions.id")
        .join("prompts", "prompts.id", "submissions.prompt_id")
        // .groupBy('topThree.prompt_time_id')
        .orderBy("topThree.score", "desc")
        .select(
            "users.id as userId",
            "users.username",
            "submissions.image",
            "submissions.rotation",
            "topThree.id",
            "prompts.prompt"
        )
        .first();
}

async function addWinner() 
{
    const winner = await db("topThree")
        .orderBy("score", "desc")
        .select("prompt_id", "story_id")
        .first();

    // If there is no winner then return and error
    if (!winner) 
    {
        return "There was no winner today?";
    }
    else 
    {
        // Otherwise return the `db("winning_stories").insert(winner);`
        return db("winning_stories").insert(winner);
    }
}

function getUser(id) 
{
    return db("users").where({ id }).first();
}

function getSubmission(userid, promptid) 
{
    return db("submissions")
        .where({ userId: userid, prompt_id: promptid })
        .first();
}

function getScoresByPromptID(promptid) 
{
    return db("submissions").select("score").where("prompt_id", promptid);
}

// This needs to be redone, might be very abusable from clients
async function rankIt(topThreeId, rank) 
{
    const newRanking = { topthree_id: topThreeId, rank };
    return await db("ranking").insert(newRanking);
}

async function addIP(newIP, id, body) 
{
    const today = moment().format("MMM Do YY");

    // Hold top three votes in order
    let votes = [null, null, null]

    // LOOP over the body
    // TODO - error handling
    for (let i = 0; i < body.length; i++) 
    {
        let submission = await db("topThree").where({id: body[i].topthree_id }).select("story_id").first();
        
        votes[body[i].rank - 1] = submission.story_id
    }

    return await db("votersIP").insert({ ip: newIP, date_voted: today, user_id: id, first_place: votes[0], second_place: votes[1], third_place: votes[2]});
}

async function getWinner(winnerId) 
{
    return await db("topThree")
        .where({ id: winnerId })
        .join("users", "topThree.user_id", "users.id")
        .join("submissions", "topThree.story_id", "submissions.id")
        .select(
            "users.username",
            "users.id as userId",
            "submissions.id",
            "submissions.image",
            "submissions.rotation"
        )
        .first();
}

// Return the last item in our db("winning_stories")
async function getYesterdaysWinner() 
{
    return await db("submissions")
        .join("winning_stories", "winning_stories.story_id", "submissions.id")
        .join("users", "users.id", "submissions.userId")
        .join("prompts", "prompts.id", "submissions.prompt_id")
        .select(
            "users.id as userId",
            "users.username",
            "submissions.image",
            "submissions.rotation",
            "prompts.prompt"
        )
        .orderBy("winning_stories.date", "desc")
        .first();
}

// Provide the Front End with a list of a users most recent submissions in order to render "today's submission and score"

// Async function usersProfile(userId) {
//     Return await db("submissions")
//     .select("*")
//     .where("userId", userId)
//     .limit(7)
// }