
exports.up = function(knex) {
  return knex.schema.createTable('upvote', table => {
      table.increments()
      table.integer('story_id').unsigned()
      .references('id').inTable('submissions')
      .onDelete('CASCADE');
      table.integer('user_id').unsigned()
      .references('id').inTable('users')
      .onDelete('CASCADE');
  })
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('upvote')
};
