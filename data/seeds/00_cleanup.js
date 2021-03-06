
const cleaner = require('knex-cleaner');

exports.seed = function(knex) 
{
    return cleaner.clean(knex, {
        mode: 'truncate', // Resets ids
        ignoreTables: ['knex_migrations', 'knex_migrations_lock'] // Don't empty migration tables
    });
};
