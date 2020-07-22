exports.up = function(knex) {
    return knex.schema.createTable('admin', table => {
        table.increments().notNullable()
        table.string('username', 128).unique().notNullable();
        table.string('password').notNullable();
        
    })
};

exports.down = function(knex) {
    return knex.schema
    .dropTableIfExists('admin')
};
