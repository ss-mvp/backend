const db = require("../../data/dbConfig.js");

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
    getVideo,
    updatePassword,
    getResetByUID,
    getFullResetRow,
    deleteResetsByUID,
    saveResetCode,
    registerUserPatternCheck
};

function getAllUsers() 
{
    return db("users");
}

function getUser(email) 
{
    return db("users").where({ email }).first();
}

function findEmail(id) 
{
    return db("users").where({ id });
};

async function addUser(user) 
{
    try  
    {
        await db("users").insert(user); return true;
    }
    catch (ex) 
    {
        console.log(ex); return false;
    }
};

function getUserIdByEmail(email) 
{
    return db("users").where({ email }).select("id").first();
};

function getUserIdByUsername(username) 
{
    return db("users").where({ username }).select("id").first();
}

async function isActivated(email) 
{
    return (await db("users").where({ email }).select("validated").first())["validated"];
};

function getToken(email) 
{
    return db("users").where({ email }).select("validationUrl", "validated", "username", "email", "id").first();
};

function activateEmail(email, validate) 
{
    return db("users").where({ email }).update(validate);
};

function getVideo()
{
    return db("admin").select("video_link");
};

function updatePassword(uid, password) 
{
    return db("users").where("id", uid).update({ password });
}

async function getResetByUID(uid) 
{
    try 
    {
        return (await db.raw("SELECT EXTRACT(EPOCH FROM (now() - (SELECT time FROM password_resets WHERE uid=?))) / 60 AS minutes LIMIT 1", [uid])).rows[0].minutes;
    }
    catch (ex) 
    {
        console.log(ex); return -1;
    }
}

function getFullResetRow(uid) 
{
    return db("password_resets").where({ uid }).first();
}

function deleteResetsByUID(uid) 
{
    return db("password_resets").where({ uid }).del();
}

async function saveResetCode(uid, code) 
{
    try 
    {
        //Using this to catch any issues with the unique column requirement
        return await db("password_resets").insert({ uid, code });
    }
    catch (ex) 
    {
        console.log(ex); return -1;
    }
}

// Regex checking if the username only contains letters and numbers
// Regex checking if the password includesCapital, includesNumber, checkLength
function registerUserPatternCheck(username, password) 
{
    const codenamePattern = /^[A-Za-z0-9]*$/;

    const includesCapital = /[A-Z]/;
    const includesNumber = /[0-9]/;

    if (codenamePattern.test(username) && 
        (password.length >= 8 && password.length <= 32) && 
        includesCapital.test(password) && 
        includesNumber.test(password)
    ) 
    {
        return true
    }
    else 
    {
        return false
    }
}
