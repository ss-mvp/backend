const router = require("express").Router();
const bc = require("bcrypt");
const auth = require("./emailModel.js");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const jwtSecret = process.env.JWT_SECRET;
const uuid = require("uuid");
const uuidNamespace = "d6d91fb8-cccc-4909-94f7-b22e17f6de22";
const querystring = require("querystring");
const mailer = require("../../services/mailer");
const restricted = require("../middleware/restricted");

router.get("/randomusername", async (req, res) => 
{

    let randomusername = auth.generateRandomUsername();
    console.log("randomusername", randomusername)

    // Check if the username is taken
    // Run the getUserIdByUsername query and if we find a match re-run the rng
    const foundUsername = await auth.getUserIdByUsername(randomusername);
    console.log("foundUsername", foundUsername)

    if (!foundUsername)
        res.status(200).json(randomusername)
    else 
    {
        randomusername = auth.generateRandomUsername();  
    }

})


router.post("/register", async (req, res) =>
{
    if (!req.body.email || !req.body.password || !req.body.username || !req.body.age)
        return res.status(400).json({ error: "Username, email, age, and password are required" });

    let { email, password, username, age, parentEmail } = req.body;

    let existingEmail = await auth.getUserIdByEmail(email);
    if (existingEmail)
        return res.status(400).json({ error: "Email already in use" });

    let existingUsername = await auth.getUserIdByUsername(username);
    if (existingUsername)
        return res.status(400).json({ error: "Username already in use" });

    // Ensure username is not an email to prevent web scrappers and "stalking like" activity for public data
    let codenameCheck = auth.registerUserPatternCheck(req.body.username, req.body.password)
    if (!codenameCheck)
        return res.status(400).json({ error: "Username or Password Invalid." });

    let validationToken = uuid.v5(username, uuidNamespace);

    let newUser =
    {
        email,
        username,
        password: bc.hashSync(password, 10),
        age,
        parentEmail,
        validationUrl: validationToken
    };

    if (!(await auth.addUser(newUser)))
        return res.status(500).json({ error: "Unknown server error" });

    let Query = querystring.stringify({ token: validationToken, email: email });

    let sendUrl = (process.env.BE_ENV === "development") ?
        `http://localhost:5000/email/activate/?${Query}` :
        `https://server.storysquad.app/email/activate/?${Query}`;

    await mailer.SendMail(parentEmail || email, "Activate your Story Squad account", "activation", { url: sendUrl });

    return res.status(200).json({ message: "User created" });
});

router.post("/login", async (req, res) =>
{
    try
    {
        if (!req.body.email || !req.body.password)
            return res.status(400).json({ error: "Email and Password required for login" });

        let User = await auth.getUser(req.body.email);

        if (!User)
            return res.status(400).json({ error: "Account does not exist" });

        if (!await auth.isActivated(req.body.email))
            return res.status(400).json({ error: "Your account must be validated" });

        if (bc.compareSync(req.body.password, User.password))
            return res.status(201).json({ username: User.username, token: signToken(User) });
        else
            return res.status(400).json({ error: "Incorrect login information" });
    }
    catch (ex)
    {
        console.log(ex);
        return res.status(500).json({ error: "Unknown server error" });
    }
});

router.get("/activate", async (req, res) =>
{
    if (!req.query.token || !req.query.email)
        return res.redirect("https://contest.storysquad.app/");
    //Return res.status(300).json({ error: 'Token and email are required for validation' });

    const data = await auth.getToken(req.query.email);
    
    if (!data || data.validated || (req.query.token !== data.validationUrl))
        return res.redirect("https://contest.storysquad.app/");
    
    await auth.activateEmail(req.query.email, { validated: true });

    const user = {
        username: data.username,
        email: data.email,
        id: data.id
    }
    const authToken = signToken(user)
    
    if (process.env.BE_ENV === "development")
        res.redirect(`http://localhost:3000/activated?authToken=${authToken}`);
    else
        res.redirect(`https://contest.storysquad.app/activated?authToken=${authToken}`);
});

router.get("/reset", async (req, res) =>
{
    if (!req.query.email)
        return res.status(300).json({ error: "Invalid email provided" });

    let User = await auth.getUser(req.query.email);

    if (!User)
        return res.status(300).json({ error: "Invalid email provided" });

    if (!User.validated)
        return res.status(400).json({ error: "Your account must be validated" });

    //Check if there is an active code
    let ResetTime = await auth.getResetByUID(User.id);

    if (ResetTime) //A code is in our DB
    {
        if (ResetTime === -1)
            return res.status(500).json({ error: "Unknown server error" });

        if (ResetTime < 10) //If it's less than 10 minutes old
            //Rate limit the creation of another code
            return res.status(502).json({ error: "A code was created less than 10 minutes ago for this email" });

        //Otherwise delete old codes
        await auth.deleteResetsByUID(User.id);
    }

    //Create new code
    let newCode = uuid.v4();

    //Store new code
    if (await auth.saveResetCode(User.id, newCode) === -1)
        return res.status(500).json({ error: "Unknown server error" });

    //E-Mail new code
    let Query = querystring.stringify({ code: newCode, email: User.email });

    let sendUrl = (process.env.BE_ENV === "development") ?
        `http://localhost:3000/reset?${Query}` :
        `https://contest.storysquad.app/reset?${Query}`;

    await mailer.SendMail(User.parentEmail, "Story Squad Password Reset", "resetpassword", { url: sendUrl, username: User.username });

    return res.status(200).json({ message: "Code created, email sent" });
});

router.post("/reset", async (req, res) =>
{
    if (!req.body.email || !req.body.code || !req.body.password)
        return res.status(300).json({ error: "Email, code, and password are required" });

    let User = await auth.getUser(req.body.email);

    if (!User)
        return res.status(300).json({ error: "Invalid email provided" });

    let ResetTime = await auth.getResetByUID(User.id);

    if (!ResetTime)
        return res.status(500).json({ error: "Expired code" });

    if (ResetTime > 10) //Password reset is 10 minutes old
    {
        await auth.deleteResetsByUID(User.id); //Delete
        return res.status(500).json({ error: "Expired code" });
    }

    //Strict compare code
    let FullCode = await auth.getFullResetRow(User.id);

    if (!FullCode || FullCode.code != req.body.code)
        return res.status(500).json({ error: "Expired code" });

    //Update password
    await auth.updatePassword(User.id, bc.hashSync(req.body.password, 10));

    //Delete reset code
    await auth.deleteResetsByUID(User.id);

    return res.status(200).json({ message: "Updated password" });
});

// Endpoint to update a users username
router.post("/resetusername", restricted(), async (req, res) => 
{
    // Ensure the user gave us their current username correctly
    // Req.username is the users true current username before the change found in their token
    // We want to ensure checks and balances are being handled in each input
    if (req.body.currentusername !== req.username) 
    {
        return res.status(400).json({ message: "Incorrect current username provided."})
    }

    // Ensure the user does not reuse their current username
    if (req.body.newusername === req.body.currentusername)
    {
        res.status(400).json({ message: "New username can not match current username."})
    }

    // Ensure the users newusername matches confirmed username
    if (req.body.confirmusername !== req.body.newusername)
    {
        res.status(400).json({ message: "New username and confirm username must match."})
    }

    // Ensure the user gave us their current username username and a new one
    if (!req.body.currentusername || !req.body.newusername || !req.body.confirmusername)
    {
        return res.status(400).json({ message: "Please complete all fields correctly."})
    }

    // Store the users id from the restricted middlware to simplify readability
    const userId = req.userId;

    // Reset the users username
    if (req.body.currentusername && req.body.newusername && req.body.confirmusername)
    {
        await auth.updateUsername(userId, req.body.newusername).then(ress => 
        {
            res.status(200).json({ message: `Username updated to ${req.body.newusername}`})
        }).catch(err => 
        {
            res.status(500).json({message: "Internal server error."})
        })
    }          
})

// Endpoint to update a users password
router.post("/resetpassword", restricted(), async (req, res) => 
{
    // Ensure the user does not reuse their current password
    if (req.body.currentpassword === req.body.newpassword)
    {
        res.status(400).json({ message: "New password can not match current password."})
    }

    // Ensure the users new password matches confirmed password
    if (req.body.confirmpassword !== req.body.newpassword)
    {
        res.status(400).json({ message: "New password and confirm password do not match."})
    }

    // Ensure the user gave us their current password, new password and a confirmed one
    if (!req.body.currentpassword || !req.body.newpassword || !req.body.confirmpassword)
    {
        return res.status(400).json({ message: "Please complete all fields correctly."})
    }

    // Store the users id from the restricted middlware to simplify readability
    const userId = req.userId;

    // Hash and reset the users password
    if (req.body.currentpassword && req.body.newpassword && req.body.confirmpassword)
    {
        await auth.updatePassword(userId, bc.hashSync(req.body.confirmpassword, 10)).then(ress => 
        {
            res.status(200).json({ message: "Password udpated successfully!"})
        }).catch(err => 
        {
            res.status(500).json({message: "Internal server error."})
        })
    }       
      
})

router.get("/video", (req, res) => 
{
    auth.getVideo()
        .then(video => res.status(200).json(video))
        .catch(err => 
        {
            console.log(err);
            res.status(500).json({ messsage: err });
        });
});

function signToken(user) 
{
    const payload = {
        username: user.username,
        email: user.email,
        id: user.id
    };

    const options = {
        expiresIn: "2d"
    };

    return jwt.sign(payload, jwtSecret, options);
}

module.exports = router;