const propmts = require("../seed_data/prompts.json")

exports.seed = function(knex) {
    // Deletes ALL existing entries
    return knex('propmts').del()
      .then(function () {
        // Inserts seed entries
        return knex('prompts').insert(prompts)
        })
}