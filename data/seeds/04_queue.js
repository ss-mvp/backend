const queue = require("../seed_data/queue.json")

exports.seed = function(knex) {
    // Deletes ALL existing entries
    return knex('prompt_queue').del()
      .then(function () {
        // Inserts seed entries
        return knex('prompt_queue').insert(queue)
        })
}