const db = require('../../data/dbConfig.js');

module.exports = {
  setWinner,
  removeWinner,
  flagContent,
  getSubmissions,
  getUsers,
  unFlagContent,
  getSubmissionsPerTime,
  getFlag
}

async function getSubmissionsPerTime() {
  const subs = await db('submissions')
  .join('prompt_time', 'prompt_time.prompt_id', 'submissions.prompt_id')
  // .where('prompt_time.prompt_id', '=', 'prompt_id')
  .where('prompt_time.time', '<', 'submissions.date')
  .andWhere('prompt_time.newGame', '>', Date.parse(new Date()))
  // console.log('time', prompt_time.newGame)
  
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
  if (flag.flagged) {
    await db('submissions').where({ id }).update({ flagged: false, flag: "" })
  } else {
    await db('submissions').where({ id }).update({ flagged: true, flag: "ADMIN FLAGGED" })
  }
  return await getFlag(id);
}

async function unFlagContent(id) {
  await db('submissions').where({ id }).update({ flagged: false, flag: "" })
  return await getFlag(id);
}

async function setWinner(details) {
  return db('topThree').insert(details);
}

function removeWinner(story_id, user_id, prompt_id) {
  return db('topThree').where({ story_id }).orWhere({ user_id }).orWhere({ prompt_id }).del()
}
