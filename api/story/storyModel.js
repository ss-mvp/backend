const db = require('../../data/dbConfig.js');

module.exports = {
  addReadability,
  disableAll,
  clearRanking,
  clearVotes,
  getPrompt,
  hasVoted,
  hasSubmitted,
  addImage,
  allPrompts,
  allStories,
  addPrompt,
  nextPrompt,
  getPromptById,
  editPrompt,
  getSubmission,
  getSubmissionURLByName,
  getVideo,
  getVideoById,
};

function disableAll() {
  return db('submissions').update({
    active: false,
    topThree: false,
    vote: false,
    voting: false
  });
}

async function clearRanking() {
  await db('topThree').del();
  await db('ranking').del();
}

async function clearVotes() {
  try
  {
    await db('users').update({ voted: false }).whereIn(
      "id",
      (await db('users').select("id").where("voted", true).pluck("id"))
    );
  } catch (ex) { console.log(ex); }
}

async function nextPrompt() {
  try
  {
    let currentPrompt = await getPrompt();

    currentPrompt.active = currentPrompt.topThree = currentPrompt.voting = currentPrompt.today = false;

    await db('prompts').update(currentPrompt).where("id", currentPrompt.id);

    //By simply doing +1 we assume a prompt id will *never* be deleted.
    return await db('prompts').update({ active: true, today: true }).where("id", currentPrompt.id + 1);
  }
  catch (ex) { console.log(ex); return -1; }
}

async function hasSubmitted(userId) {
  try
  {
    return await db("submissions")
        .select("id")
        .where({ active: true, userId: userId })
        .first();
  }
  catch (ex) { console.log(ex); return false; }
}

async function hasVoted(userId) {
  return (await db("users")
    .select("voted")
    .where({ id: userId })
    .first()).voted;
}

function getPromptById(id) {
  return db('prompts').where({ id }).first();
}

function addReadability(link, readability) {
  return db('submissions').where('image', '=', link).update({ readability });
}

function getSubmission(id) {
  return db('submissions').where({ id });
}

async function getSubmissionURLByName(id) {
  return await db('submissions')
    .select('image', 'active')
    .where({ image: id })
    .first();
}

async function addImage(image) {
  try { return (await db('submissions').insert(image).returning('id'))[0]; }
  catch (ex) { console.log(ex); return -1; }
}

async function getPrompt() {
    return (await db('prompts')
      .where("today", true)
      .first());
}

function getVideoById(id) {
  return db('admin').where({ id }).first();
}

async function getVideo() {
  const videos = await db('admin');
  let id = 0;
  let largest = 0;
  videos.map((element) => {
    if (parseInt(element.video_time) > largest) {
      largest = element.video_time;
      id = element.id;
    }
  });
  const return_video = await getVideoById(id);
  return return_video;
}

function allPrompts() {
  return db('prompts');
}

function allStories() {
  return db('submissions');
}

function addPrompt(newPrompt) {
  return db('prompts').insert(newPrompt);
}

function editPrompt(id, edits) {
  return db('prompts').where({ id }).update(edits);
}