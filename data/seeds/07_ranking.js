exports.seed = function(knex) {
    // Deletes ALL existing entries
    return knex('ranking').del()
      .then(function () {
        // Inserts seed entries
        return knex('ranking').insert([
            { "topthree_id": 1, "rank" : 1 },
            { "topthree_id": 2, "rank" : 2 },
            { "topthree_id": 3, "rank" : 3 },
            { "topthree_id": 2, "rank" : 1 },
            { "topthree_id": 1, "rank" : 2 },
            { "topthree_id": 3, "rank" : 3 },
            { "topthree_id": 3, "rank" : 1 },
            { "topthree_id": 2, "rank" : 2 },
            { "topthree_id": 1, "rank" : 3 },
            { "topthree_id": 1, "rank" : 1 },
            { "topthree_id": 3, "rank" : 2 },
            { "topthree_id": 2, "rank" : 3 },
            { "topthree_id": 1, "rank" : 1 },
            { "topthree_id": 2, "rank" : 2 },
            { "topthree_id": 3, "rank" : 3 },
            { "topthree_id": 3, "rank" : 1 },
            { "topthree_id": 2, "rank" : 2 },
            { "topthree_id": 1, "rank" : 3 },
            { "topthree_id": 3, "rank" : 1 },
            { "topthree_id": 1, "rank" : 2 },
            { "topthree_id": 2, "rank" : 3 }
        ]);
  })
};