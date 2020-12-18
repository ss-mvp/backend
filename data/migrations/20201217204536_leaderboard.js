exports.up = function(knex) {
    return knex.schema.createTable("leaderboard", function(column) {
        // create an id for each ranking on the leaderboard
        column.increments().notNullable();

        column
            .integer("user_id")
            .unsigned()
            .references("id")
            .inTable("users")
            .onDelete("CASCADE");

        column
            .string("name")
            .unsigned()
            .references("name")
            .inTable("users")
            .onDelete("CASCADE");

        // submissions score is possibly what i need to add to finish this migration
        // TODO add ranking score
    });
};

exports.down = function(knex) {};