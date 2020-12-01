exports.up = function(knex)
{
    return knex.schema.createTable("admins", function(table)
    {
        //This should tie to a user id
        table.integer("uid").notNullable().unique();
    });
};

exports.down = function(knex)
{
    return knex.schema.dropTable("admins");
};