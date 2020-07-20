// const moment = require('moment');

// function nextDay(day, hours) {
//   // day = day.add(16, 'hours');
//   // day = day.add(30, 'minutes')
//   // return day
//   Date.prototype.addHours = function(h) {
//     this.setTime(this.getTime() + (h*60*60*1000));
//     return Date.parse(this);
//   }

//   return Date.parse(Date(day.addHours(hours)))

// }

exports.up = function(knex) {
  return knex.schema.createTable('users', table => {
      table.increments();
      table.string('username', 128).unique().notNullable().index()
      table.string('email', 128).unique().notNullable().index();
      table.string('password').notNullable();
      table.string('validationUrl').notNullable();
      table.boolean('validated').defaultTo(false);
  })
  .createTable('prompts', table => {
    table.increments();
    table.string('prompt');
    table.boolean('active').defaultTo(false);
    table.boolean('topThree').defaultTo(false);
    table.boolean('voting').defaultTo(false);
  })
  .createTable('prompt_time', table => {
    table.increments();
    table.integer('prompt_id').unsigned().notNullable()
    .references('id').inTable('prompts')
    table.string('time').defaultTo(Date.parse(new Date()));
    table.string('end').defaultTo(Date.parse(new Date()) + (59400000 - 1));
    table.string('newGame').defaultTo(Date.parse(new Date()) + (86400000 - 1));
  })
  .createTable('prompt_queue', table => {
    table.integer('id');
    table.string('queue', 128);
  })
  .createTable('submissions', table => {
      table.increments();
      table.string('image').index();
      table.string('pages', 2000000);
      table.boolean('flagged').defaultTo(false);
      table.string('flag').defaultTo('None')
      table.jsonb('readability');
      table.float('score')
      table.integer('prompt_id').unsigned()
      .references('id').inTable('prompts')
      .onDelete('CASCADE');
      table.integer('userId').unsigned()
      .references('id').inTable('users')
      .onDelete('CASCADE');
      table.string('date').defaultTo(Date.parse(new Date()))
  })
};

exports.down = function(knex) {
  return knex.schema
  .dropTableIfExists('submissions')
  .dropTableIfExists('prompt_queue')
  .dropTableIfExists('prompt_time')
  .dropTableIfExists('prompts')
  .dropTableIfExists('users')
};
