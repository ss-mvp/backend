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
  createQueue,
  getPromptById
}

function createQueue(id) {
  console.log(id)
  return db('prompt_queue').insert({ queue: [id] })
}

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
  if (queue.length === 0) {
    return []
  } else {
    const queue_id = queue[queue.length - 1];
    console.log(Number(queue_id.queue))
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
  return db('prompt_queue').select('queue');
}

async function addToQueue(id) {
  const queue = await getQueue()[0];
  console.log('add', queue)
  queue = queue.split(',');
  if (queue.length === 7) {
    queue.push(id);
    queue = queue.splice(1, queue.length - 1).join();
  } else if (queue.length < 7) {
    queue.push(id)
  }
  
  return db('prompt_queue').where('id', '=', '1').update(queue);
}

function addPrompt(prompt) {
  return db('prompt').insert(prompt)
}