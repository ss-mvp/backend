exports.seed = function(knex) {
    // Deletes ALL existing entries
    return knex('topThree').del()
      .then(function () {
        // Inserts seed entries
        return knex('topThree').insert([
            {
                "user_id": 6,
                "story_id": 6,
                "prompt_id": 1,
                "prompt_time_id": 1
            },
            {
                "user_id": 12,
                "story_id": 12,
                "prompt_id": 1,
                "prompt_time_id": 1
            },
            {
                "user_id": 9,
                "story_id": 9,
                "prompt_id": 1,
                "prompt_time_id": 1
            }
        ]);
      });
  };