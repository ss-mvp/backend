const { default: Axios } = require("axios");
const moment = require("moment");
const router = require("express").Router();
const db = require("../../data/dbConfig");
const restricted = require("../middleware/restricted");
const { getPrompt, getPromptById } = require("../story/storyModel");

const {
    getTopThree,
    rankIt,
    getFinalScores,
    addIP,
    getVotes,
    getYesterdaysWinner
} = require("./rankingModel");

router.get("/", async (req, res) => 
{
    try 
    {
        let Today = await getPrompt();

        if (!Today.voting)
            return res.status(400).json({ error: "Voting has not started today" });

        const top = await getTopThree();
        res.status(200).json(top);
    }
    catch (err) 
    {
        res.status(500).json({ error: "Internal Server Error" });
        console.log(err);
    }
});

router.get("/votes", async (req, res) => 
{
    try 
    {
        const top = await getVotes();
        console.log(top);
        res.status(200).json(top);
    }
    catch (err) 
    {
        res.status(500).json({ error: "Cannot get Votes" });
        console.log(err);
    }
});

router.post("/", checkIP, async (req, res) => 
{
    try 
    {
        let Today = await getPrompt();

        if (!Today.voting)
            return res.status(400).json({ error: "Voting has not started today" });

        let ranks = req.body.map((el) => 
        {
            rankIt(el.topthree_id, el.rank);
        });

        await Promise.all(ranks);

        await addIP(req.userIP);

        return res.status(200).json({
            message: "Submitted",
            tomorrow: (await getPromptById(Today.id + 1)).prompt
        });
    }
    catch (err) 
    {
        console.log(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/winner", async (req, res) => 
{
    try 
    {
        let Today = await getPrompt();
        let yesterdaysWinner;
        if (Today.voting || Today.topThree || Today.active || !Today) 
        {
            // OLD CODE >> return res.status(400).json({ error: "No winners declared yet" });

      // return the result of our getYesterdayWinner function
      yesterdaysWinner = await getYesterdaysWinner();
      return res.status(200).json(yesterdaysWinner);
    }

        let allThree;
        try 
        {
            allThree = await getFinalScores();
            console.log(allThree);
            return res.status(200).json(allThree);
        }
        catch (err) 
        {
            return res
                .status(500)
                .json({ error: `Cannot get 3 winners because ${err}` });
        }
    }
    catch (err) 
    {
        return res.status(500).json({ error: `${err}` });
    }
});

//Helper function to checkIP
async function checkIP(req, res, next) 
{
    //AWS Reverse IP is going to follow this format:
    //  47.35.217.125, 172.31.24.10
    //According to the Elastic IP's list, we won't see
    //IPV6 Addresses, so we can assume we WILL have v4
    //Addresses only, and the latest IP should be the 1st
    let ipToCheck = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    let Comma = ipToCheck.indexOf(",");

    if (Comma === -1) 
    {
        //If localhost reset to 127 localhost
        if (req.connection.remoteAddress === "::1") ipToCheck = "127.0.0.1";

        //If using default remoteaddr, the IP should lead with ::, so let's remove it
        if (ipToCheck === req.connection.remoteAddress)
            ipToCheck = req.connection.remoteAddress.replace(/^.*:/, "");
    }
    else ipToCheck = ipToCheck.substr(0, Comma);

    const today = moment().format("MMM Do YY");

    const alreadyVoted = await db("votersIP")
        .where({ ip: ipToCheck, date_voted: today })
        .first();
    if (alreadyVoted) 
    {
        console.log("Don't even try, cheater");
        console.log("see? you did vote -->", alreadyVoted);
        res.status(400).json({ message: "Cannot vote again today" });
    }
    else 
    {
        req.userIP = ipToCheck;
        console.log("req.userIP", req.userIP);
        next();
    }
}

module.exports = router;
