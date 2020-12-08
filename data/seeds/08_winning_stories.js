const stories = require("../seed_data/winningStories.json");

exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex("winning_stories")
    .del()
    .then(function () {
      // Inserts seed entries
      return knex("winning_stories").insert(stories);
    });
};
