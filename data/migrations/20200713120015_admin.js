exports.up = function (knex) 
{
    return knex.schema.createTable('admin', table => 
    {
        table.increments();
        table.string('video_link').notNullable();
        table.string('video_time').notNullable();
        table.string('video_id').notNullable();
    });
};

exports.down = function (knex) 
{
    return knex.schema
        .dropTableIfExists('admin');
};
