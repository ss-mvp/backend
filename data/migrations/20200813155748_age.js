const { table } = require("../dbConfig");

exports.up = function (knex) 
{
    return knex.schema.alterTable("users", table => 
    {
        table.integer("age").notNullable().defaultTo(13);
        table.string("parentEmail", 128);
        table.timestamps(false, true);
    });
};

exports.down = function (knex) 
{
    return knex.schema.alterTable("users", table => 
    {
        table.dropTimestamps();
        table.dropColumn("parentEmail");
        table.dropColumn("age");
    });
};
