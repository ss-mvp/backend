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
  getPromptById
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
  return db('prompt').where({ id }).first();
}

function addReadability(link, readability) {
    return db('submissions').where('image', '=', link).update({ readability })
}

function addImage(image) {
  return db('submissions').insert(image);
}

function getDate() {
  return db('prompt').select('date');
}

async function getPrompt() {
  // return db('prompt').where({ date }).first();
  const queue = await getQueue();
  // console.log(queue)
  if (queue.queue.length === 0) {
    return []
  } else {
    const queue_id = queue.queue.slice(-1)[0];
    console.log('queue', queue_id)
    console.log('type', typeof queue_id)
    return getPromptById(queue_id);
  }
}

function allPrompts() {
  return db('prompt');
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
    queue = [] // empty string
    queue.push(id)
    console.log('queue',queue)
    write_queue = {
      queue: queue.join()
    }
    return db('prompt_queue').where('id', '=', 1).update(write_queue);
  } else {
    queue = queue.queue.split(',');
    if (queue.length === 30) {
      queue.push(id);
      queue = queue.splice(1, queue.length - 1).join();
    } else if (queue.length < 30) {
      queue.push(id)
      return db('prompt_queue').where('id', '=', 1).update(queue.join());
    }
  }
}

function addPrompt(prompt) {
  return db('prompt').insert(prompt)
}