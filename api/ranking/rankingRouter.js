const router = require("express").Router();

const { getTopThree, rankIt, getFinalScores, addIP } = require("./rankingModel");

// hello heroku

router.get("/topthree", async (req, res) => {
  try {
    const topThree = await getTopThree()
    res.status(200).json(topThree)
  }
  catch(err){
    res.status(500).json({ message: 'Cannot get Top Three' })
  }
});

router.post("/rankthree", checkIP, async(req, res) => {
  try {
    let ranks = req.body.map(el => {
      rankIt(req.body.topThreeId, req.body.rank)
    })
    await Promise.all(ranks)
    await addIP(req.ip)
    res.status(200).json({ message: 'ranking successful' })
  }
  catch(err){
    res.status(500).json({ message: `${error}` })
  }
})

router.get("/winner", async(req, res) => {
  try {
    let allThree = await getFinalScores()
    let winner;
    let maxScore = 0;
    allThree.forEach(el => {
      if (el.score > maxScore){
        maxScore = el.score
        winner = el.topThreeId
      }
    })
    
  }
  catch(err){
    res.status(500).json({ message: `${error}` })
  }
})

//helper function to checkIP
async function checkIP(req, res, next){
  const ipToCheck = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const today = moment(new Date(), MMM-DD-YYYY)
  const alreadyVoted = await db("votersIP").where({ ip: ipToCheck, date_voted: today }).first()
  if (alreadyVoted){
    res.staus(400).json({ message: 'Cannot vote again today' })
  } else {
    req.ip = ipToCheck
  }
  next()
}


module.exports = router;
