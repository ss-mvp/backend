const submissions = require("../seed_data/submissions.json")

exports.seed = function(knex) {
    // Deletes ALL existing entries
    return knex('submissions').del()
      .then(function () {
        // Inserts seed entries
        return knex('submissions').insert(submissions)
        })
}