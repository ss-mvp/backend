const router = require("express").Router();
const upload = require("../services/file-upload.js");
const story = require("./storyModel.js");
const users = require("../email/emailModel.js");
const moment = require("moment");
const restricted = require("../api/middleware/restricted.js");
const { PythonShell } = require("python-shell");
const dotenv = require("dotenv");
dotenv.config();

const attemptJSONParse = (data) => {
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
};

const onlyTranscription = (data) => {
  data["images"] && data["metadata"];
};

// This is a working route to upload a file to AWS
// using the file-upload.js helper function.

router.post("/", restricted, async (req, res) => {
  const singleUpload = upload.single("image");
  singleUpload(req, res, async function (e) {
    const images = [];
    images.push(req.body.base64Image);

    let transcribed = await transcribe({ images });
    transcribed = JSON.parse(transcribed);
    console.log(transcribed);
    let readability = await readable({ story: transcribed.images[0] });
    readability = JSON.parse(readability);
    console.log(readability);

    if (e) return res.status(400).json({ error: e.message });

    const sendPackage = {
      image: req.file.location,
      pages: transcribed,
      readability,
      prompt_id: req.body.promptId,
      userId: req.userId,
    };

    await story
      .addImage(sendPackage)
      .then((response) => {
        console.log("It wrote");
      })
      .catch((err) => console.log(err));

    return res.status(201).json({ imageUrl: req.file.location });
  });
});

router.get("/prompt", restricted, async (req, res) => {
  const today = moment().toArray();
  let promptDate = "";
  await story
    .getDate()
    .then(async (response) => {
      response.map((e, i) => {
        if (i === 0 && today <= e.date) {
          promptDate = e.date;
        }
        if (today >= e.date) {
          try {
            if (today <= response[i + 1].date && i + 1 < response.length - 1) {
              promptDate = e.date;
            }
          } catch {
            promptDate = e.date;
          }
        }
      });
      story
        .getPrompt(promptDate)
        .then((resp) => {
          return res.status(200).json(resp);
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

router.get("/", restricted, async (req, res) => {
  const prompts = await story.allPrompts();
  return res.json({ prompts });
});

router.get("/story", restricted, async (req, res) => {
  const userInfo = await users.getAllUsers();

  const allStory = await story.allStories();

  return res.json({ stories: allStory, userInfo });
});

const runScript = (path, data, findResults) => {
  const newShell = new PythonShell(path, { stdio: "pipe" });
  return new Promise((resolve, reject) => {
    newShell.stdin.write(JSON.stringify(data));
    newShell.stdin.end();

    let out = [];
    newShell.stderr.on("error", (...err) => reject(...err));
    newShell.stdout.on("data", (...data) => (out = [...out, ...data]));
    newShell.stdout.on("close", () => resolve(out));
  });
};

function transcribe(data) {
  return runScript("./scripts/transcription.py", data, (out) =>
    out.map(attemptJSONParse).find(onlyTranscription)
  );
}

function readable(story) {
  return runScript("./scripts/readability.py", story, (out) =>
    out.map(attemptJSONParse)
  );
}

module.exports = router;
