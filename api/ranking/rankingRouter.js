const moment = require('moment')
const router = require("express").Router();
const db = require("../../data/dbConfig")

const { get, getWinner, getTopThree, rankIt, getFinalScores, addIP } = require("./rankingModel");

// hello heroku

router.get("/", async (req, res) => {
  try {
    const top = await getTopThree()
    console.log(top)
    res.status(200).json(top)
  }
  catch(err){
    res.status(500).json({ message: 'Cannot get Top Three' })
  }
});

router.post("/", checkIP, async(req, res) => {
  try {
    try{
      console.log('tryin to save ranks')
      let ranks = req.body.map(el => {
        rankIt(el.topThreeId, el.rank)
      })
      await Promise.all(ranks)
    } catch(error){
      return res.status(500).json({ message: `Cannot save your ranks` })
    }
    
    try{
      console.log('tryin to save IP')
      await addIP(req.userIP)
    } catch(error){
      return res.status(500).json({ message: `Cannot save IP` })
    }

    return res.status(200).json({ message: 'ranking successful' })
  }
  catch(err){
    return res.status(500).json({ message: `${err}` })
  }
})

router.get("/winner", async(req, res) => {
  try {
    let allThree = await getFinalScores()
    let first, second, third;
    let maxScore = 0;
    let secondScore = 0;
    allThree.forEach(el => {
      if (el.score > maxScore){
        maxScore = el.score
        first = el.topThreeId
      } else if (el.score >= secondScore){
        secondScore = el.score
        second = el.topThreeId
      } else {
        third = el.topThreeId
      }
    })
    let winner = await getWinner(first)
    let runnerUp = await getWinner(second)
    let lastPlace = await getWinner(third)
    res.status(200).json([winner, runnerUp, lastPlace])
  }
  catch(err){
    res.status(500).json({ message: `${error}` })
  }
})

//helper function to checkIP
async function checkIP(req, res, next){
  const ipToCheck = "ermaderp"
  // const ipToCheck = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const today = moment().format("MMM Do YY");
  const alreadyVoted = await db("votersIP").where({ ip: ipToCheck, date_voted: today }).first()
  if (alreadyVoted){
    res.staus(400).json({ message: 'Cannot vote again today' })
  } else {
    req.userIP = ipToCheck
    console.log(req.userIP)
    next()
  }
}


module.exports = router;
