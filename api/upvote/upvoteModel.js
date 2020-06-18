const db = require('../../data/dbConfig.js');

const getUpvotesByStory = (storyId) => {
    return db('upvote').where('story_id', storyId)
}

const addUpvote = (payload) => {
    return db('upvote')
        .insert(payload)
}

const removeUpvote = (storyId, userId) => {
    return db('upvote').where("story_id", storyId && "user_id", userId).del()
}


module.exports = {
    getUpvotesByStory,
    addUpvote,
    removeUpvote
}
