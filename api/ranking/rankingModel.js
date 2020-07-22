const moment = require('moment')
const db = require('../../data/dbConfig.js');

module.exports = {
    getTopThree,
    getFinalScores,
    rankIt,
    addIP,
    getWinner,
};


async function getTopThree(){
    const today = moment(new Date(), MMM-DD-YYYY)
    return await db("topThree").where({ date_competed: today})
}
async function getFinalScores(){
    //return 3 ids
    const today = moment(new Date(), MMM-DD-YYYY)
    const topThree = await db("topThree").where({ date_competed: today })
    //O(3)
    let allRanks = topThree.map( el => {

        let one = db("ranking").where("topThreeId", el.id ).count({ rank: 1 })
        let two = db("ranking").where("topThreeId", el.id ).count({ rank: 2 })
        let three = db("ranking").where("topThreeId", el.id ).count({ rank: 3 })
        
        const allNums = Promise.all([one, two, three])

        let totalScore = ((allNums[0]*3) + (allNums[1]*2) + (allNums[2]))
        return {
            ...el,
            score: totalScore
        }
        
    })

    return allRanks
};

async function rankIt(topThreeId, rank){
    return await db("ranking").insert({ rank }).where({ topThreeId });
};

async function addIP(newIP){
    const today = moment(new Date(), MMM-DD-YYYY)
    return await db("votersIP").insert({ ip: newIP, date_voted: today })
}

async function getWinner(winnerId){
    return await db("topThree")
    .where({ topThreeId: winnderId })
    .join("users", "topThree.user_id", "users.id")
    .first()
}