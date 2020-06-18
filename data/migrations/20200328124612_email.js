const moment = require('moment');

exports.up = function(knex) {
  return knex.schema.createTable('users', table => {
      table.increments();
      table.string('email', 128).unique().notNullable().index();
      table.string('password').notNullable();
      table.string('validationUrl').notNullable();
      table.boolean('validated').defaultTo(false);
  })
  .createTable('prompt', table => {
    table.increments();
    table.boolean('active').defaultTo(false);
    table.string('prompts');
    table.string('date');
  })
  .createTable('submissions', table => {
      table.increments();
      table.string('image').index();
      table.string('pages');
      table.jsonb('readability');
      table.integer('prompt_id').unsigned()
      .references('id').inTable('prompt')
      .onDelete('CASCADE');
      table.integer('userId').unsigned()
      .references('id').inTable('users')
      .onDelete('CASCADE');
  })
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('users')
    .dropTableIfExists('prompt')
    .dropTableIfExists('submissions')
};
