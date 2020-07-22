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
  getVideo,
  getVideoById,
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

function getVideoById(id) {
  return db('admin').where({ id }).select('video_id').first();
}

async function getVideo() {
  const videos = await db('admin');
  const id = 0;
  const largest = 0;
  videos.map(element => {
    if (parseInt(element.video_time > largest)) {
      largest = element.video_time
      id = element.id
    }
  })
  const return_video = await getVideoById(id);
  return return_video
}

function addVideo(videoAndTime) {
  return db('admin').insert(videoAndTime);
}

async function getSubmissionsPerTime() {
  const subs = await db('submissions')
  .join('prompt_time', 'prompt_time.prompt_id', 'submissions.prompt_id')
  .join('prompts', 'submissions.prompt_id', 'prompts.id')
  // .where('prompt_time.prompt_id', '=', 'prompt_id')
  .whereNot("submissions.flagged", true)
  .where('prompt_time.time', '<', 'submissions.date')
  .andWhere('prompt_time.newGame', '>', Date.parse(new Date()))
  .select('submissions.id as id', )
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
