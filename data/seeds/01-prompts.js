const moment = require('moment');

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('prompt').del()
    .then(function () {
      // Inserts seed entries
      return knex('prompt').insert([
        {id: 1, active: false, prompts: 'Set your pirate story aboard the fastest ship on the high seas.', date: moment().hours(17).minutes(30).toArray()},
        {id: 2, active: false, prompts: 'Write a story that includes a flying magic carpet.', date: moment().hours(17).minutes(30).add(1, 'days').toArray()},
        {id: 3, active: false, prompts: 'Your sports team has a rematch against the defending champions that crushed you the last time you played, but this time you have a secret weapon.  What is it and how does it help you win this time around?', date: moment().hours(17).minutes(30).add(2, 'days').toArray()},
        {id: 4, active: false, prompts: "Imagine it's 2120 and when your arrive to school, you find out you have a math test you haven't studied for. What do you do?", date: moment().hours(17).minutes(30).add(3, 'days').toArray()},
        {id: 5, active: false, prompts: "NASA tryouts!  You've been selected to be the first kid to walk on Mars. Write about what happens when your space mission goes horribly wrong.", date: moment().hours(17).minutes(30).add(4, 'days').toArray()},
        {id: 6, active: false, prompts: "You're an undercover park ranger tracking animal poachers in a nature preserve.  How do you protect the animals and deliver justice to the poachers? Write a scene.", date: moment().hours(17).minutes(30).add(5, 'days').toArray()},
        {id: 7, active: false, prompts: "You're part of a crew exploring a new world and venture out to meet leaders from a newly discovered tribe of native inhabitants. Write a scene in which you negotiate peace between the two groups.", date: moment().hours(17).minutes(30).add(6, 'days').toArray()},
        {id: 8, active: false, prompts: 'A character is lost in a maze and time is running out.', date: moment().hours(17).minutes(30).add(7, 'days').toArray()},
        {id: 9, active: false, prompts: 'A prince and/or princess are trapped in a castle dungeon.  How do they escape?', date: moment().hours(17).minutes(30).add(8, 'days').toArray()},
        {id: 10, active: false, prompts: 'Two kids build a robot to fight crime.', date: moment().hours(17).minutes(30).add(9, 'days').toArray()},
        {id: 11, active: false, prompts: 'Everyone who ventures into the forbidden enchanted forest is never seen again.  ', date: moment().hours(17).minutes(30).add(10, 'days').toArray()},
        {id: 12, active: true, prompts: 'Invent a new super hero who saves their city from destruction.', date: moment().hours(17).minutes(30).add(11, 'days').toArray()},
      ]);
    });
};
