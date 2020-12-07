exports.up = function(knex)
{
    return knex.schema.createTable("password_resets", function(table)
    {
        //This should tie to a user id
        table.integer("uid").notNullable().unique();

        //Reset code
        table.string("code", 36).unique().notNullable();

        table.timestamp("time", true).notNullable().defaultTo(knex.fn.now());
    });
};

exports.down = function(knex)
{
    return knex.schema.dropTable("password_resets");
};
