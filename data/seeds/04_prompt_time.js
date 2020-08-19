const now = Math.round((new Date()). getTime() / 1000);
const end = now + 59400
const new_game = now + 86400

exports.seed = function(knex) {
    // Deletes ALL existing entries
    return knex('queue').del()
      .then(function () {
        // Inserts seed entries
        return knex('queue').insert({
            "prompt_id": 1,
            "time": now,
            "end": end,
            "newGame": new_game
            })
        })
}