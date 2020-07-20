
exports.seed = function(knex) {
    // Deletes ALL existing entries
    return knex('users').del()
      .then(function () {
        // Inserts seed entries
        return knex('users').insert([
            {
                username: 'ElongatedMuskrat',
                email: 'zimashima@gmail.com',
                password: '$2b$10$ECMudLuZE7Y.du6tUqACh.n5U9Tizykr5LUYlM0IAoFbpb3Amj31a',
                validationUrl: '$2b$10$sigYcfShRF1aoyig12ErC.ByyqJmYOYRDkYUIBh1DycMrSV6K7x4S',
                validated: true
            },
            {
                username: 'CaroleBaskin',
                email: 'CaroleBaskin@bigcat.com',
                password: '$2b$10$ECMudLuZE7Y.du6tUqACh.n5U9Tizykr5LUYlM0IAoFbpb3Amj31a',
                validationUrl: '$3b$09$sigYcfShRF1aoyig12ErC.ByyqJmYOYRDkYUIBh1DycMrSV6K7x4S',
                validated: true
            }
        ]);
      });
  };
