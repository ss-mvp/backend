const router = require("express").Router();
const s3 = require("../../services/file-upload.js");
const heicConvert = require("heic-convert");
const fileUpload = require("express-fileupload");
const piexif = require("piexifjs");
const story = require("./storyModel.js");
const users = require("../email/emailModel.js");
const admin = require("../admin/adminModel.js")
const moment = require("moment");
const restricted = require("../middleware/restricted.js");
const dotenv = require("dotenv");
const adminRestricted = require("../middleware/adminRestricted.js");
const { TextProcess } = require("../../services/text-processing.js");
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

//SigFind uses a common methodology of scanning a files raw bytes of data
//and comparing them to a given prerequisite to determine whether the file
//contains the specified data, O(nm)
function SigFind(buffer, sig)
{
    try
    {
        let SigBuf = Buffer.from(sig.replace(/ /g, ""), "hex");

        for (let i = 0; i < buffer.length; i++)
        {
            for (let x = 0; x < SigBuf.length; x++)
                if (buffer[i + x] !== SigBuf[x])
                    break;
                else if (x === SigBuf.length - 1)
                    return i;
        }

        return -1;
    }
    catch
    {
        return -1;
    }
}

async function TranslateFile(File)
{
  try
  {
    if ((SigFind(File.data, "FF D8 FF") === 0 && SigFind(File.data, "FF D9") != -1) && File.mimetype.includes("image/jp")) //JPEG
    {
      //Remove EXIF Data
      let b64New = piexif.remove(`data:image/jpg;base64,${File.data.toString('base64')}`);
      
      return Buffer.from(b64New.substring(22), "base64");
    }
    else if (SigFind(File.data, "66 74 79 70 68 65 69 63") - 4 === 0 && File.mimetype === "application/octet-stream") //HEIC
    {
      //Convert because vision and browsers don't default show HEIC
      let OutBuffer = await heicConvert({
        buffer: File.data,
        format: "JPEG",
        quality: 0.5
      });
      
      //Remove EXIF Data
      let b64New = piexif.remove(`data:image/jpg;base64,${OutBuffer.toString('base64')}`);

      return Buffer.from(b64New.substring(22), "base64");
    }
    else if (SigFind(File.data, "89 50 4E 47 0D 0A 1A 0A") != -1 && File.mimetype.includes("image/png")) //PNG
      // PNG does now specify support for EXIF, whereas it used to purely be
      // metadata tags. Unsure of how widely this will be adopted, the most I can
      // find in the wild is Adobe signing the software version on exported files.
      // - LGV-0
      // http://ftp-osl.osuosl.org/pub/libpng/documents/pngext-1.5.0.html#C.eXIf
      return File.data;

    return -1;
  }
  catch (ex)
  {
    /*
      HEIC Conversion or Piexif EXIF cleaning may throw errors
      Foreseeable possibilities of this happening:
      - Image data corrupted
      - JPEG is detected by signature but was sent as a .PNG
    */
    console.log(ex);
    return -1;
  }
}

let _FileUploadConf = fileUpload(
  {
    limits: { fileSize: 25 * 1024 * 1024 },
    abortOnLimit: true,
    responseOnLimit: "File size too large",
    uploadTimeout: 40000 //40 Sec
  });
router.post("/", restricted, _FileUploadConf, async (req, res) => {
  let Out = await TranslateFile(req.files.image);

  if (Out === -1)
    return res.status(400).json({ error: "File invalid" });

  let Raw = Out;

  //Transcribe and rate the image
  let { transcription, readability, flagged } = await TextProcess(Raw);

  let newKey = Date.now().toString();

  //Upload to S3 Directly
  s3.upload(
    {
      Bucket: "storysquad",
      Key: newKey,
      Body: Raw
    }, async function (err, data) {
      if (err)
      {
        console.log(err);
        return res.status(400).json({ error: err });
      }
      else
      {
        //Create the database insert
        const sendPackage = {
          image: newKey,
          pages: transcription,
          readability,
          prompt_id: req.body.promptId,
          userId: req.userId,
          flag: flagged.flagged,
          flagged: flagged.terms,
          score: readability.ranking_score
        };

        //AddImage, this also has a select that's creating an error
        //But the error isn't for anything useful so idk
        await story
          .addImage(sendPackage)
          .then((response) => {
            console.log(response);
          })
          .catch((err) => console.log(err));
        
        //Return the new S3 link url
        return res.status(201).json({ imageUrl: newKey });
      }
    }
  )
});

router.get("/image/:id", restricted, async (req, res) =>
{
  let ID = req.params.id;

  if (!ID)
    return res.status(400).json({ error: "Invalid request paramaters" });
  
  ID = parseInt(ID);

  //Get the name of the image
  let Submission = await story.getSubmissionURLByName(ID);

  if (!Submission)
    return res.status(404).json({ error: "Submission not found in DB" });

  if (!Submission.active)
    return res.status(403).json({ error: "You do not have access to this resource" });

  s3.getObject(
    {
      Bucket: "storysquad",
      Key: Submission.image
    }).on("httpHeaders", function(statusCode, headers) {
      res.set("Content-Length", headers["content-length"]);
      res.set("Content-Type", headers["content-type"]);
      res.set("Cache-control", "private, max-age=86400");
      this.response.httpResponse.createUnbufferedStream().pipe(res);
      res.status(statusCode);
    }).on("error", function (err)
    {
      console.log(err);
    }).send();
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

module.exports = router;
