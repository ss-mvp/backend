const db = require('../../data/dbConfig.js');
const moment = require("moment")

module.exports = {
    getTopThree,
    getFinalScores,
    rankIt,
    addIP,
    getWinner,
    getVotes,
    getUser,
    getSubmission,
    getTodaysScores
};

async function getTopThree(){
    return await db("topThree")
    .join('users', 'topThree.user_id', 'users.id')
    .join('submissions', 'submissions.id', 'topThree.story_id')
    .orderBy('topThree.id', 'desc').limit(3)
    .select(
        'topThree.id as id',
        'submissions.userId',
        'users.username',
        'submissions.image',
        'submissions.pages'
    )
}

async function getVotes(){
    return await db("ranking")
}

async function getFinalScores(){
    //return 3 ids

    const topThree = await db("topThree").orderBy('id', 'desc').limit(3)
    //O(3)
    let allRanks = topThree.map( async (el) => {

        let one = db("ranking").where({ topthree_id: el.id, rank: 1 })
        let two = db("ranking").where({ topthree_id: el.id, rank: 2 })
        let three = db("ranking").where({ topthree_id: el.id, rank: 3 })
        
        const allNums = await Promise.all([one, two, three])
        let totalScore = 0
        totalScore = ((allNums[0].length *3) + (allNums[1].length*2) + allNums[2].length)

        return await db("topThree").where({ id: el.id }).update({ score: totalScore })
    })

    await Promise.all(allRanks)

    return await db("topThree")
        .join("users", 'topThree.user_id', "users.id")
        .join("submissions", 'topThree.story_id', "submissions.id")
        // .groupBy('topThree.prompt_time_id')
        .orderBy('topThree.score', 'desc')
        // .select("users.username", "submissions.image", 'topThree.id')
        .limit(3)

};

function getUser(email) {
    return db('users').where({ email }).first();
}

function getSubmission(userid) {
    return db('submissions').where({ "userId": userid, "active": true }).first();
}

function getTodaysScores() {
    return db('submissions').select("score").where("active", "=", true);
}

//This needs to be redone, might be very abusable from clients
async function rankIt(topThreeId, rank){
    const newRanking = {topthree_id: topThreeId, rank}
    return await db("ranking").insert(newRanking)
};

async function addIP(newIP){
    const today = moment().format("MMM Do YY");
    console.log(await db("votersIP"))
    return await db("votersIP").insert({ ip: newIP, date_voted: today })
}

async function getWinner(winnerId){
    return await db("topThree")
    .where({ id: winnerId })
    .join("users", "topThree.user_id", "users.id")
    .join("submissions", "topThree.story_id", "submissions.id")
    .select("users.username", "topThree.id", "submissions.images")
    .first()
}