const { getLeaderboard } = require("./leaderboardModel");
const router = require("express").Router();

router.get("/", async (req, res) => 
{
    try 
    {
        const leaderboard = await getLeaderboard();
        res.status(200).json(leaderboard);
    }
    catch (err) 
    {
        res.status(500).json({ error: "Internal Server Error" });
        console.log(err);
    }
});

module.exports = router;
