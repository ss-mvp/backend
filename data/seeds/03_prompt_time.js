exports.seed = function(knex) {
    // Deletes ALL existing entries
    return knex('prompt_time').del()
      .then(function () {
        // Inserts seed entries
        return knex('prompt_time').insert({
            "prompt_id": 1
          })
        })
}