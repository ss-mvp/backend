const db = require('../../data/dbConfig.js');

module.exports = {
  setWinner,
  removeWinner,
  flagContent,
  getSubmissions,
  getUsers,
  unFlagContent,
  getSubmissionsPerTime,
  getFlag,
  addVideo,
  // getVideo,
  // getVideoById,
  updateTopThree,
  // getCurrentPromptTime,
  // getAllVotes
}

// This needs to get fixed
// async function getAllVotes(story_id, prompt_id, prompt_time_id) {
//   return db('submissions')
//   .join('prompts', 'prompt_id', 'submission.prompt_id')
//   .join('prompt_time', 'prompt_time.prompt_id', 'submissions.prompt_id')
//   .join('topThree', 'topThree.story_id', 'submissions.id')
//   .select('topThree.score', )
// }

function addVideo(videoAndTime) {
  return db('admin').insert(videoAndTime);
}

async function getSubmissionsPerTime() {
  const subs = await db('submissions')
    .join('prompts', 'submissions.prompt_id', 'prompts.id')
    .join('prompt_time', 'submissions.prompt_id', 'prompt_time.prompt_id')
    .join('users', 'users.id', 'submissions.userId')
    // .where('prompt_time.prompt_id', '=', 'prompt_id')
    .whereNot("submissions.flagged", true)
    .where('prompt_time.time', '<', 'submissions.date')
    .andWhere('prompt_time.newGame', '>', Date.parse(new Date()))
    .select(
      'submissions.id as id',
      'submissions.userId',
      'users.username',
      'submissions.prompt_id',
      'submissions.active',
      'submissions.topThree',
      'submissions.image',
      'submissions.pages',
      'submissions.flagged',
      'submissions.flag',
      'submissions.vote',
      'submissions.voting',
      'submissions.readability',
      'submissions.score'
    )
    .orderBy('score', 'desc')
    .limit(10)
  return subs
}

function getUsers() {
  return db('users').select('username', 'id');
}

function getSubmissions() {
  return db('submissions').where('flagged', '=', 'false');
}

function getFlag(id) {
  return db('submissions').select('flagged').where({ id }).first();
}

async function flagContent(id) {
  const flag = await getFlag(id)
  console.log(flag)
  if (!flag) {
    await db('submissions').where({ id }).update({ flagged: false, flag: "None" })
  } else {
    await db('submissions').where({ id }).update({ flagged: true, flag: "ADMIN FLAGGED" })
  }
  return await getFlag(id);
}

async function unFlagContent(id) {
  await db('submissions').where({ id }).update({ flagged: false, flag: "None" })
  return await getFlag(id);
}

async function setWinner(details) {
  return await db('topThree').insert(details);
}

async function updateTopThree(story_id){
  return await db('submissions').where({ id: story_id }).update({ vote: true, topThree: true })
}

function removeWinner(story_id, user_id, prompt_id) {
  return db('topThree').where({ story_id }).orWhere({ user_id }).orWhere({ prompt_id }).del()
}
