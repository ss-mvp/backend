const router = require("express").Router();
const upload = require("../../services/file-upload.js");
const story = require("./storyModel.js");
const users = require("../email/emailModel.js");
const admin = require("../admin/adminModel.js")
const moment = require("moment");
const restricted = require("../middleware/restricted.js");
const { PythonShell } = require("python-shell");
const dotenv = require("dotenv");
const adminRestricted = require("../middleware/adminRestricted.js");
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

// router.get('/user/:id', restricted, async (req, res) => {
//   const user = await auth.findEmail(req.params.id);
//   if (user) {
//       return res.status(200).json({ user });
//   } else {
//       return res.status(400).json({ error: "No user found with that ID." });
//   }
// })

router.post("/", restricted, async (req, res) => {
  const singleUpload = upload.single("image");
  singleUpload(req, res, async function (e) {
    const images = [];
    images.push(req.body.base64Image);

    let transcribed = await transcribe({ images });
    transcribed = JSON.parse(transcribed);
    // console.log(transcribed);

    let readability = await readable({ story: transcribed.images[0] });
    readability = JSON.parse(readability);
    console.log(readability)

    // if (e) return res.status(400).json({ error: e.message });

    const sendPackage = {
      image: req.file.location,
      pages: transcribed,
      readability,
      prompt_id: req.body.promptId,
      userId: req.userId,
      flag: transcribed.flagged.flag,
      flagged: transcribed.flagged.isFlagged,
      score: readability.ranking_score
    };
    console.log('send', sendPackage)

    await story
      .addImage(sendPackage)
      .then((response) => {
        console.log(response);
      })
      .catch((err) => console.log(err));

    return res.status(201).json({ imageUrl: req.file.location });
  })
});

router.get('/video', restricted, async (req, res) => {
  const video = await story.getVideo();
  const returnPackage = {
    video_id: video.video_id,
    video_link: video.video_link
  }
  // console.log(video)
  return res.json({ returnPackage });
})

router.get('/time', restricted, async (req, res) => {
  const prompt = await story.getPrompt();
  if (prompt) {
    const time = await story.getTime(prompt.id);
    if (time) {
      return res.status(200).json({ time });
    } else {
      return res.status(400).json({ error: "Something went wrong." })
    }
  } else {
    return res.status(400).json({ error: "No active prompt." })
  }
})

router.get("/prompt", restricted, async (req, res) => {
  const prompt = await story.getPrompt();
  if (prompt.length === 0) {
    return res.status(500).json({ error: 'Something went wrong.' })
  } else {
    if (prompt.active === true) {
      return res.status(200).json({ prompt });
    } else {
      return res.status(500).json({ error: 'Prompt not active.' })
    }
  }
})

router.get('/all_prompts', adminRestricted, async (req, res) => {
  const prompts = await story.allPrompts();
  if (!prompts) {
    return res.status(500).json({ error: "Something went wrong." })
  } else {
    return res.json(prompts)
  }
})

router.delete('/prompts/:id', adminRestricted, async (req, res) => {
  const prompt = await story.getPromptById(req.params.id);
  if (prompt) {
    story.deletePrompt(req.params.id).then(response => {
      return res.status(201).json({ message: `Prompt ID ${req.params.id} was removed.` })
    }).catch(err => console.log(err));
  } else {
    return res.status(400).json({ error: "Prompt doesn't exist." })
  }
})

router.get("/", restricted, async (req, res) => {
  const prompts = await story.allPrompts();
  return res.json({ prompts });
});



router.put('/edit/:id', restricted, (req, res) => {
  // there needs to be id and edits in req packet
  console.log(req.body)
  if (req.params.id && req.body.prompt) {
    story.editPrompt(req.body, req.params.id).then(() => {
      return res.status(200).json({ message: `Prompt ${req.id} was edited successfully.` })
    }).catch(err => console.log(err));
  } else {
    return res.status(400).json({ error: "You need to supply the ID and text to edit writing prompt." })
  }
})

router.post('/add', adminRestricted, (req, res) => {
  console.log(req.body)
  if (req.body.prompt) {
    story.addPrompt(req.body).then(() => {
      return res.status(200).json({ message: "Prompt added" })
    }).catch(err => console.log(err));
  } else {
    return res.status(400).json({ error: "You must add writing prompt text to add a prompt." })
  }
})

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
