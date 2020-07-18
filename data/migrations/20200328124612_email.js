const moment = require('moment');

function nextDay(day) {
  day = day.add(16, 'hours');
  day = day.add(30, 'minutes')
  return day
}

exports.up = function(knex) {
  return knex.schema.createTable('users', table => {
      table.increments();
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
    table.string('time').defaultTo(moment().format());
    table.string('end').defaultTo(nextDay(moment()));
    table.string('newGame').defaultTo(moment().add(1, 'days').format());
  })
  .createTable('prompt_queue', table => {
    table.integer('id');
    table.string('queue', 128);
  })
  .createTable('submissions', table => {
      table.increments();
      table.string('image').index();
      table.string('pages');
      table.boolean('flagged').defaultTo(false);
      table.jsonb('readability');
      table.integer('prompt_id').unsigned()
      .references('id').inTable('prompts')
      .onDelete('CASCADE');
      table.integer('userId').unsigned()
      .references('id').inTable('users')
      .onDelete('CASCADE');
      table.string('date').defaultTo(moment().format('MMM DD h:mm A'))
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
