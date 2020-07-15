const db = require('../../data/dbConfig.js');

module.exports = {
  // setWinner,
  // removeWinner,
  // flagContent,
  getSubmissions,
}

function getSubmissions() {
    return db('submissions').select()
}
