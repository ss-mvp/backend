const moment = require('moment');

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('prompts').del()
    .then(function () {
      // Inserts seed entries
      return knex('prompts').insert([
        {prompt: 'Set your pirate story aboard the fastest ship on the high seas.', active: false},
        {prompt: 'Write a story that includes a flying magic carpet.', active: false},
        {prompt: 'Your sports team has a rematch against the defending champions that crushed you the last time you played, but this time you have a secret weapon.  What is it and how does it help you win this time around?', active: false},
        {prompt: "Imagine it's 2120 and when your arrive to school, you find out you have a math test you haven't studied for. What do you do?", active: false},
        {prompt: "NASA tryouts!  You've been selected to be the first kid to walk on Mars. Write about what happens when your space mission goes horribly wrong.", active: false},
        {prompt: "You're an undercover park ranger tracking animal poachers in a nature preserve.  How do you protect the animals and deliver justice to the poachers? Write a scene.", active: false},
        {prompt: "You're part of a crew exploring a new world and venture out to meet leaders from a newly discovered tribe of native inhabitants. Write a scene in which you negotiate peace between the two groups.", active: false},
        {prompt: 'A character is lost in a maze and time is running out.', active: false},
        {prompt: 'A prince and/or princess are trapped in a castle dungeon.  How do they escape?', active: false},
        {prompt: 'Two kids build a robot to fight crime.', active: false},
        {prompt: 'Everyone who ventures into the forbidden enchanted forest is never seen again.', active: false},
        {prompt: 'Invent a new super hero who saves their city from destruction.', active: false},
      ]);
    });
};
