const queue = require("../seed_data/queue.json")

exports.seed = function(knex) {
    // Deletes ALL existing entries
    return knex('queue').del()
      .then(function () {
        // Inserts seed entries
        return knex('queue').insert(queue)
        })
}