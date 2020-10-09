const db = require('../../data/dbConfig.js');

module.exports = {
  addReadability,
  disableAll,
  clearRanking,
  getPrompt,
  getDate,
  addImage,
  allPrompts,
  allStories,
  addToQueue,
  addPrompt,
  deletePrompt,
  getPromptById,
  editPrompt,
  wipeQueue,
  getTime,
  getQueue,
  setTime,
  getAllTimes,
  getSubmission,
  getSubmissionURLById,
  getVideo,
  getVideoById
}

function getAllTimes(id) {
  return db('prompt_time').join("prompts", "prompts.id", "prompt_time.prompt_id").where({ prompt_id: id });
}

function wipeQueue() {
  return db('prompt_queue').where({ id: 1 }).update({ queue: '' });
}

function disableAll() {
  return db('submissions').update({ active: false, topThree: false, vote: false, voting: false });
}

async function clearRanking() {
  await db('topThree').del();
  await db('ranking').del();
}

function getPromptById(id) {
  return db('prompts').where({ id }).first();
}

function deletePrompt(id) {
  return db('prompts').where({ id }).del();
}

function addReadability(link, readability) {
    return db('submissions').where('image', '=', link).update({ readability })
}

function getSubmission(id) {
  return db('submissions').where({ id });
}

async function getSubmissionURLById(id) {
  return await db("submissions").select("image", "active").where({ id: id }).first();
}

async function addImage(image) {
  const { id } = await db('submissions').insert(image);
  return getSubmission(id);
}

function getDate() {
  return db('prompts').select('date');
}

async function getPrompt() {
  // return db('prompt').where({ date }).first();
  const queue = await getQueue();
  // console.log(queue)
  if (queue.queue.length === 0) {
    return []
  } else {
    const queue_id = queue.queue.split(",").slice(-1)[0];
    // console.log(await getPromptById(queue_id));
    // console.log('queue', queue_id)
    // console.log('type', typeof queue_id)
    return await getPromptById(queue_id);
  }
}

function getVideoById(id) {
  return db('admin').where({ id }).first();
}

async function getVideo() {
  const videos = await db('admin');
  let id = 0;
  let largest = 0;
  videos.map(element => {
    if (parseInt(element.video_time) > largest) {
      largest = element.video_time
      id = element.id
    }
  })
  const return_video = await getVideoById(id);
  return return_video
}

function allPrompts() {
  return db('prompts');
}

function allStories() {
  return db('submissions');
}

function getQueue() {
  return db('prompt_queue').select('queue').first();
}

async function addToQueue(id) {
  let queue = await getQueue();

  if (queue.queue.length === 0) {
    newQueue = [] // empty string
    newQueue.push(id)
    console.log('queue',newQueue)
    write_queue = {
      queue: newQueue.join()
    }
    return db('prompt_queue').where('id', '=', 1).update(write_queue);
  } else {
    queue = queue.queue.split(',');
    if (queue.length === 30) {
      queue.push(id);
      queue = queue.splice(1, queue.length - 1).join();
    } else if (queue.length < 30) {
      queue.push(id)
      return db('prompt_queue').where('id', '=', 1).update({ queue: queue.join() });
    }
  }
}

function addPrompt(newPrompt) {
  return db('prompts').insert(newPrompt)
}

function editPrompt(id, edits) {
  return db('prompts').where({ id }).update(edits);
}

async function getTime(prompt_id) {
  const start = await db('prompt_time').where({ prompt_id }).select('time').first();
  const end = await db('prompt_time').where({ prompt_id }).select('end').first();
  const newGame = await db('prompt_time').where({ prompt_id }).select('newGame').first();
  console.log(start, end, newGame);
  return {start, end, newGame}
}

function setTime(id) {
  return db('prompt_time').where({ id }).insert({ prompt_id: id });
}