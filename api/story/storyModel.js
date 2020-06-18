const db = require('../data/dbConfig.js');

module.exports = {
  addReadability,
  getPrompt,
  getDate,
  addImage,
  allPrompts,
  allStories
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

function getPrompt(date) {
  return db('prompt').where({ date }).first();
}

function allPrompts() {
  return db('prompt').select('prompts');
}

function allStories() {
  return db('submissions');
}