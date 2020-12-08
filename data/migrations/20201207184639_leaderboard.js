exports.up = function (knex) {
  return knex.schema.createTable("leaderboard", function (table) {
    // give every entry its own ID
    table.increments().notNullable();

    // find the userName by connecting the submissions table and the users table with the userID FK found in the submissions table
    table.string("username", 128);

    // pull the users squadScore from the submissions table
    table
      .float("score")
      .unsigned()
      .references("score")
      .inTable("submissions")
      .onDelete("CASCADE");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("leaderboard");
};
