const moment = require("moment");

exports.up = function (knex) 
{
    return knex.schema.createTable("winning_stories", function (table) 
    {
    // Give each winning_story and id
        table.increments().notNullable();

        // Create a foreign key called submissionId which references the submission id column in the submission table
        // Todo - change to story_id
        table
            .integer("story_id")
            .unsigned()
            .references("id")
            .inTable("submissions")
            .onDelete("CASCADE");

        // The prompt for the day needs to be pulled from the prompts table
        // The Fk we are looking at is the prompt name
        // We need to grab the prompt from today's active prompt
        table
            .integer("prompt_id")
            .unsigned()
            .references("id")
            .inTable("prompts")
            .onDelete("CASCADE");

        // Save today's time for the submission
        // Todo - remove udpated at time
        table.date("date").notNullable().defaultTo(knex.raw("current_date"));
    });
};

exports.down = function (knex) 
{
    return knex.schema.dropTableIfExists("winning_stories");
};
