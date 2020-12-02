exports.up = function (knex) {
  return knex.schema.createTable("winning_stories", function (table) {
    // give each winning_story and id
    table.increments().notNullable();

    // create a foreign key called submissionId which references the submission id column in the submission table
    table
      .integer("submission_id")
      .unsigned()
      .references("id")
      .inTable("submissions")
      .onDelete("CASCADE");

    // the prompt for the day needs to be pulled from the prompts table
    // the Fk we are looking at is the prompt name
    // we need to grab the prompt from today's active prompt
    table
      .integer("prompt_id")
      .unsigned()
      .references("id")
      .inTable("prompts")
      .onDelete("CASCADE");

    // save today's time for the submission
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("winning_stories");
};
