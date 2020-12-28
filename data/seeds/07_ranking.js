const ranking = require("../seed_data/ranking.json")

exports.seed = function(knex) 
{
    // Deletes ALL existing entries
    return knex('ranking').del()
        .then(function () 
        {
        // Inserts seed entries
            return knex('ranking').insert(ranking)
        })
}