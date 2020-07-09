
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('topThree').del()
    .then(function () {
      // Inserts seed entries
      return knex('topThree').insert([
        {id: 15, user_id: 1, prompt_id: 1, story_id: 20, score: 0},
        {id: 16, user_id: 2, prompt_id: 1, story_id: 21, score: 0},
        {id: 17, user_id: 3, prompt_id: 1, story_id: 22, score: 0},
      ]);
    });
};
