const db = require('../data/dbConfig.js');

module.exports = {
    getAllUsers,
    getUser,
    findEmail,
    addUser,
    getUserId,
    checkActivation,
    activateEmail,
    toggleFirstLogin,
    getToken,
    removeUser,
}

function getAllUsers() {
    return db('users');
}

function getUser(email) {
    return db('users').where({ email }).first();
}

function findEmail(id) {
    return db('users').where({ id });
};

function addUser(user) {
    return db('users').insert(user);
};

function getUserId(email) {
    return db('users').where({ email }).select('id').first();
};

function checkActivation(email) {
    return db('users').where({ email }).select('validated').first();
};

function getToken(email) {
    return db('users').where({ email }).select('validationUrl').first();
};

function removeUser(id) {
    return db('users').where({ id }).del();
    // return db('users').where({ id })
}

async function activateEmail(email, validate) {
    await db('users').where({ email }).update(validate);
    return checkActivation(email);
};

async function toggleFirstLogin(email) {
    await db('users').where({ email }).update({ firstLogin: false });
    return db('users').where({ email }).select('firstLogin').first();
};