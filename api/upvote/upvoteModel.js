const db = require('../../data/dbConfig.js');


async function getFinalScores(promptId){

    const topThree = await db("topThree").where({ promptId }).select({ id })
    
    //O(3)
    let allRanks = topThree.map( el => {
        let one = db("ranking").where("topThreeId", el ).count({ rank: 1 })
        let two = db("ranking").where("topThreeId", el ).count({ rank: 2 })
        let three = db("ranking").where("topThreeId", el ).count({ rank: 3 })

        Promise.all([one, two, three])
        
    })

    let allRanksSolved = Promise.all(allRanks)


    
    return await db("topThree").where({ promptId })
};
  
function rankIt(topThreeId, rank){
    return db("ranking").insert({ rank }).where({ topThreeId });
};

module.exports = {
    getUpvotesByStory,
    rankIt,
};