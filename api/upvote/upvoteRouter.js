const router = require("express").Router();

const { getUpvotesByStory, addUpvote, removeUpvote } = require("./upvoteModel");

// hello heroku

router.get("/:storyId", async (req, res) => {
  try {
    let upvotes = await getUpvotesByStory(req.params.storyId);
    let [userVote] = upvotes.filter((el) => el.user_id === req.userId);
    let userHasVoted;
    {
      userVote ? (userHasVoted = true) : (userHasVoted = false);
    }
    res
      .status(200)
      .json({
        storyId: req.params.storyId,
        votes: upvotes.length,
        userVoted: userHasVoted,
      });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Sorry, couldn't get any upvotes for this story" });
  }
});

router.post("/:storyId", async (req, res) => {
  try {
    await addUpvote({ story_id: req.params.storyId, user_id: req.userId });
    res
      .status(201)
      .json({
        message: `Story ID ${storyId} has been upvoted by User ID ${req.userId}`,
      });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Sorry, couldn't add your upvote at the moment" });
  }
});

router.delete("/:storyId", async (req, res) => {
  try {
    await removeUpvote(req.params.storyId, req.userId);
    res
      .status(200)
      .json({
        message: `User ID ${req.userId}'s story ID ${req.params.storyId}'s upvote has been removed`,
      });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Sorry, couldn't delete your upvote at the moment" });
  }
});

module.exports = router;
