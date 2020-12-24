const topThree = require("../seed_data/topThree.json")

exports.seed = function(knex) 
{
    // Deletes ALL existing entries
    return knex('topThree').del()
        .then(function () 
        {
        // Inserts seed entries
            return knex('topThree').insert(topThree)
        })
}