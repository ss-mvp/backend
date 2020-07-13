const db = require('../../data/dbConfig.js');


async function getFinalScores(promptId){

    //return 3 ids
    const topThree = await db("topThree").where({ promptId })
    
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
  
function rankIt(topThreeId, rank){
    return db("ranking").insert({ rank }).where({ topThreeId });
};

module.exports = {
    getUpvotesByStory,
    rankIt,
};