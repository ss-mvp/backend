const db = require('../../data/dbConfig.js');

module.exports = {
  addReadability,
  getPrompt,
  getDate,
  addImage,
  allPrompts,
  allStories,
  addToQueue,
  addPrompt,
  // createQueue,
  deletePrompt,
  getPromptById,
  editPrompt,
  wipeQueue,
  getTime,
  getQueue
}

function wipeQueue() {
  return db('prompt_queue').where({ id: 1 }).update({ queue: '' });
}

// function createQueue(id) {
//   console.log(id)
//   const add_array = [];
//   add_array.push(id);
//   console.log('add_array', add_array)
//   const save_string = add_array.join();
//   return db('prompt_queue').insert(save_string);
// }

function getPromptById(id) {
  return db('prompts').where({ id }).first();
}

function deletePrompt(id) {
  return db('prompts').where({ id }).del();
}

function addReadability(link, readability) {
    return db('submissions').where('image', '=', link).update({ readability })
}

function addImage(image) {
  return db('submissions').insert(image);
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
    const queue_id = queue.queue.slice(-1)[0];
    // console.log('queue', queue_id)
    // console.log('type', typeof queue_id)
    return getPromptById(queue_id);
  }
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

async function getTime(id) {
  const start = await db('prompts').where({ id }).select('time');
  const end = await db('prompts').where({ id }).select('end');
  const newGame = await db('prompts').where({ id }).select('newGame');
  return {start, end, newGame}
}