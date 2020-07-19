const db = require('../../data/dbConfig.js');

module.exports = {
  setWinner,
  removeWinner,
  flagContent,
  getSubmissions,
}

function getSubmissions() {
    return db('submissions').where('flagged', '=', 'false');
}

function flagContent(id) {
  return db('submissions').where({ id }).update({ flagged: true, flag: "ADMIN FLAGGED" })
}

async function setWinner(details) {
  // details is an object containing the following:
  // story_id, user_id, prompt_id, and prompt_time
  return db('topThree').insert(details);
}

function removeWinner(story_id, user_id, prompt_id) {
  return db('topThree').where({ story_id }).orWhere({ user_id }).orWhere({ prompt_id }).del()
}
