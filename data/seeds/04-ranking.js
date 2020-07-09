
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('ranking').del()
    .then(function () {
      // Inserts seed entries
      return knex('ranking').insert([
        { topthree_id: 15, rank: 1 },
        { topthree_id: 16, rank: 2 },
        { topthree_id: 17, rank: 3 },
        { topthree_id: 15, rank: 1 },
        { topthree_id: 16, rank: 3 },
        { topthree_id: 17, rank: 2 },
        { topthree_id: 15, rank: 1 },
        { topthree_id: 16, rank: 2 },
        { topthree_id: 17, rank: 3 },
        { topthree_id: 15, rank: 2 },
        { topthree_id: 16, rank: 1 },
        { topthree_id: 17, rank: 3 },
        { topthree_id: 15, rank: 3 },
        { topthree_id: 16, rank: 1 },
        { topthree_id: 17, rank: 2 },
        { topthree_id: 15, rank: 2 },
        { topthree_id: 16, rank: 3 },
        { topthree_id: 17, rank: 1 },
        
      ]);
    });
};
