exports.seed = function(knex) {
    // Deletes ALL existing entries
    return knex('prompt_time').del()
      .then(function () {
        // Inserts seed entries
        return knex('prompt_time').insert(
            {
                "prompt_id": 1,
                "time": 1595350739000,
                "end": 1595410138999,
                "newGame": 1595532599000.
            }
        );
      });
  };