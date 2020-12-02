const db = require('../../data/dbConfig.js');

module.exports = {
    getAllUsers,
    getUser,
    findEmail,
    addUser,
    getUserIdByEmail,
    getUserIdByUsername,
    isActivated,
    activateEmail,
    getToken,
    getVideo
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

async function addUser(user) {
    try  { await db('users').insert(user); return true; }
    catch (ex) { console.log(ex); return false; }
};

function getUserIdByEmail(email) {
    return db('users').where({ email }).select('id').first();
};

function getUserIdByUsername(username) {
    return db('users').where({ username }).select('id').first();
}

async function isActivated(email) {
    return (await db('users').where({ email }).select('validated').first())['validated'];
};

function getToken(email) {
    return db('users').where({ email }).select('validationUrl', 'validated').first();
};

function activateEmail(email, validate) {
    return db('users').where({ email }).update(validate);
};

function getVideo(){
    return db('admin').select('video_link')
}