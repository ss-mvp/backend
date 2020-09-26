const moment = require('moment')
const router = require("express").Router();
const db = require("../../data/dbConfig")

const { get, getWinner, getTopThree, rankIt, getFinalScores, addIP, getVotes } = require("./rankingModel");

// hello heroku

router.get("/", async (req, res) => {
  try {
    const top = await getTopThree()
    console.log(top)
    res.status(200).json(top)
  }
  catch(err){
    res.status(500).json({ message: 'Cannot get Top Three', error: err })
  }
});

router.get("/votes", async (req, res) => {
  try {
    const top = await getVotes()
    console.log(top)
    res.status(200).json(top)
  }
  catch(err){
    res.status(500).json({ message: 'Cannot get Votes', error: err })
  }
});

router.post("/", checkIP, async(req, res) => {
// router.post("/", async(req, res) => {
  try {
    try{
      console.log('tryin to save ranks')
      let ranks = req.body.map(el => {
        rankIt(el.topthree_id, el.rank)
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
    let allThree
    try{
      allThree = await getFinalScores()
      console.log(allThree)
      return res.status(200).json(allThree)
    } catch (err){
      return res.status(500).json({ message: `Cannot get 3 winners because ${err}` })
    }
    
  }
  catch(err){
    return res.status(500).json({ message: `${err}` })
  }
})

//helper function to checkIP
async function checkIP(req, res, next) {
  //AWS Reverse IP is going to follow this format:
  //  47.35.217.125, 172.31.24.10
  //According to the Elastic IP's list, we won't see
  //IPV6 Addresses, so we can assume we WILL have v4
  //addresses only, and the latest IP should be the 1st
  let ipToCheck = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  let Comma = ipToCheck.indexOf(',');

  if (Comma === -1)
  {
    //If localhost reset to 127 localhost
    if (req.connection.remoteAddress === "::1")
      ipToCheck = "127.0.0.1";

    //If using default remoteaddr, the IP should lead with ::, so let's remove it
    if (ipToCheck === req.connection.remoteAddress)
      ipToCheck = req.connection.remoteAddress.replace(/^.*:/, '');
  }
  else
    ipToCheck = ipToCheck.substr(0, Comma);

  const today = moment().format("MMM Do YY");
  
  const alreadyVoted = await db("votersIP").where({ ip: ipToCheck, date_voted: today }).first()
  if (alreadyVoted){
    console.log("Don't even try, cheater")
    console.log("see? you did vote -->", alreadyVoted)
    res.status(400).json({ message: 'Cannot vote again today' })
  } else {
    req.userIP = ipToCheck
    console.log("req.userIP", req.userIP)
    next()
  }
}


module.exports = router;
