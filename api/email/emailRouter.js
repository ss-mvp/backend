const router = require('express').Router();
const bc = require('bcrypt');
const auth = require('./emailModel.js');
const nm = require('nodemailer');
const jwt = require('jsonwebtoken');
const hbs = require('nodemailer-express-handlebars');
const dotenv = require('dotenv');
dotenv.config();
const restricted = require('../middleware/restricted.js');
const jwtSecret = process.env.JWT_SECRET;
const ses = require('nodemailer-ses-transport');
const uuid = require('uuid');
const uuidNamespace = "d6d91fb8-cccc-4909-94f7-b22e17f6de22";
const querystring = require("querystring");

router.post('/register', async (req, res) =>
{
  if (!req.body.email || !req.body.password || !req.body.username || !req.body.age)
    return res.status(400).json({ error: 'Username, email, age, and password are required' });

  let { email, password, username, age, parentEmail } = req.body;

  let existingEmail = await auth.getUserIdByEmail(email);
  if (existingEmail)
    return res.status(400).json({ error: 'Email already in use' });

  let existingUsername = await auth.getUserIdByUsername(username);
  if (existingUsername)
    return res.status(400).json({ error: 'Username already in use' });

  let validationToken = uuidv4();

  let newUser =
  {
    email,
    username,
    password: bc.hashSync(password, 10),
    age,
    parentEmail,
    validationUrl: validationToken,
  };

  if (!(await auth.addUser(newUser)))
    return res.status(500).json({ error: "Unknown server error" });

  let Query = querystring.stringify({ token: validationToken, email: email });

  let sendUrl = (process.env.BE_ENV === 'development') ?
    `http://localhost:5000/email/activate/?${Query}` :
    `https://server.storysquad.app/email/activate/?${Query}`;

  // send email to parent instead of user, if given.
  // ToDo: change this to a separate ToS/PP confirmation email
  sendEmail(parentEmail || email, sendUrl);

  return res.status(200).json({ message: 'User created' });
});

router.post('/login', async (req, res) =>
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

router.get('/activate', async (req, res) =>
{
  if (!req.query.token || !req.query.email)
    return res.redirect("https://contest.storysquad.app/");
    //return res.status(300).json({ error: 'Token and email are required for validation' });

  const data = await auth.getToken(req.query.email);

  if (!data || data.validated || (req.query.token !== data.validationUrl))
    return res.redirect("https://contest.storysquad.app/");

  await auth.activateEmail(req.query.email, { validated: true });

  if (process.env.BE_ENV === 'development')
    res.redirect(`http://localhost:3000/activated?token=${req.query.token}`);
  else
    res.redirect(`https://contest.storysquad.app/activated?token=${req.query.token}`);
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

router.get('/video', (req, res) => {
  auth.getVideo()
    .then(video => res.status(200).json(video))
    .catch(err => {
      console.log(err)
      res.status(500).json({ messsage: err })
    })
})

function sendEmail(email, url) {
  const transporter = nm.createTransport(
    ses({
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    })
  );

  const handlebarOptions = {
    viewEngine: {
      extName: '.handlebars',
      partialsDir: './templates/',
      layoutsDir: './templates/',
      defaultLayout: 'email.handlebars',
    },
    viewPath: './templates/',
    extName: '.handlebars',
  };

  transporter.use('compile', hbs(handlebarOptions));

  transporter.sendMail(
    {
      from: 'support@storysquad.app',
      to: email,
      subject: 'Activate your Story Squad account',
      context: {
        url: url,
      },
      template: 'email',
    },
    (err, info) => {
      if (err) console.log(err);
      if (info) {
        console.log(info.envelope);
        console.log(info.messageId);
      }
    }
  );
}

function signToken(user) {
  const payload = {
    username: user.username,
    email: user.email,
    id: user.id,
  };

  const options = {
    expiresIn: '1d',
  };

  return jwt.sign(payload, jwtSecret, options);
}

module.exports = router;