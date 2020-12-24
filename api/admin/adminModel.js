const db = require('../../data/dbConfig.js');

module.exports = {
    isAdmin,
    setWinner,
    removeWinner,
    flagContent,
    getSubmissions,
    getUsers,
    unFlagContent,
    getSubmissionsPerTime,
    getFlag,
    addVideo,
    removeSubmissionsByEmail,
    updateTopThree,
    getSubmissionURLById
}

async function isAdmin(id) 
{
    let Admin = await db("admins").where({ uid: id }).first();
  
    if (Admin && Admin.uid == id)
        return true;

    return false;
}

async function removeSubmissionsByEmail(email) 
{
    const { id } = await db('users').where({ email })
    return db('submissions').where(id, userId).del()
}

function addVideo(videoAndTime) 
{
    return db('admin').insert(videoAndTime);
}

async function getSubmissionsPerTime() 
{
    return await db('submissions').where(
        {
            active: true
        })
        .orderBy('score', 'desc')
        .limit(10)
        .join('users', 'users.id', 'submissions.userId')
        .select(
            'submissions.id as id',
            'submissions.userId',
            'users.username',
            'submissions.prompt_id',
            'submissions.active',
            'submissions.topThree',
            'submissions.image',
            'submissions.pages',
            'submissions.flagged',
            'submissions.flag',
            'submissions.vote',
            'submissions.voting',
            'submissions.score'
        );
}

function getUsers() 
{
    return db('users').select('username', 'id');
}

function getSubmissions() 
{
    return db('submissions').where('flagged', '=', 'false');
}

async function getSubmissionURLById(id) 
{
    return (await db("submissions").select("image").where({ id: id }).first()).image;
}

function getFlag(id) 
{
    return db('submissions').select('flagged').where({ id }).first();
}

async function flagContent(id) 
{
    const flag = await getFlag(id)
    console.log(flag)
    if (!flag) 
    {
        await db('submissions').where({ id }).update({ flagged: false, flag: "None" })
    }
    else 
    {
        await db('submissions').where({ id }).update({ flagged: true, flag: "ADMIN FLAGGED" })
    }
    return await getFlag(id);
}

async function unFlagContent(id) 
{
    await db('submissions').where({ id }).update({ flagged: false, flag: "None" })
    return await getFlag(id);
}

async function setWinner(details) 
{
    return await db('topThree').insert(details);
}

async function updateTopThree(story_id)
{
    return await db('submissions').where({ id: story_id }).update({ vote: true, topThree: true })
}

function removeWinner(story_id, user_id, prompt_id) 
{
    return db('topThree').where({ story_id }).orWhere({ user_id }).orWhere({ prompt_id }).del()
}