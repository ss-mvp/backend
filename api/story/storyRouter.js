const router = require("express").Router();
const s3 = require("../../services/file-upload.js");
const heicConvert = require("heic-convert");
const fileUpload = require("express-fileupload");
const piexif = require("piexifjs");
const story = require("./storyModel.js");
const restricted = require("../middleware/restricted.js");
const dotenv = require("dotenv");
const adminRestricted = require("../middleware/adminRestricted.js");
const { TextProcess } = require("../../services/text-processing.js");
dotenv.config();

//SigFind uses a common methodology of scanning a files raw bytes of data
//And comparing them to a given prerequisite to determine whether the file
//Contains the specified data, O(nm)
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
                quality: 0.7
            });
      
            //Remove EXIF Data
            let b64New = piexif.remove(`data:image/jpg;base64,${OutBuffer.toString('base64')}`);

            return Buffer.from(b64New.substring(22), "base64");
        }
        else if (SigFind(File.data, "89 50 4E 47 0D 0A 1A 0A") != -1 && File.mimetype.includes("image/png")) //PNG
        // PNG does now specify support for EXIF, whereas it used to purely be
        // Metadata tags. Unsure of how widely this will be adopted, the most I can
        // Find in the wild is Adobe signing the software version on exported files.
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
router.post("/", restricted(), _FileUploadConf, async (req, res) => 
{
    if (await story.hasSubmitted(req.userId))
        return res.status(400).json({ error: "You have already submitted today" });
  
    let OutBuffer = await TranslateFile(req.files.image);

    if (OutBuffer === -1)
        return res.status(400).json({ error: "File invalid" });

    let newKey = Date.now().toString();

    //Upload to S3 Directly
    s3.upload(
        {
            Bucket: "storysquad",
            Key: newKey,
            Body: OutBuffer
        }, async function (err, data) 
        {
            if (err)
            {
                console.log(err);
                return res.status(400).json({ error: "Error uploading file to LTS" });
            }
            else
            {
                //Call DS Component
                let DSInfo = await TextProcess(newKey, require("crypto").createHash("sha512").update(OutBuffer).digest("hex"));

                if (!DSInfo)
                {
                    //Last minute error..?
                    s3.deleteObject(
                        { Bucket: "storysquad", Key: newKey },
                        function(err, data) 
                        {
                            if (err) console.log(err) 
                        }
                    );
                    return res.status(500).json({ error: "Internal Server Error" });
                }

                //Create the database insert
                const sendPackage = {
                    image: newKey,
                    prompt_id: (await story.getPrompt()).id,
                    userId: req.userId,
                    flagged: DSInfo.ModerationFlag,
                    score: DSInfo.Complexity,
                    rotation: DSInfo.Rotation
                };

                //If this fails, we've got an image in the s3 with no DB link, in practice,
                //This image is "lost" and we need some way to "know" this happened so our
                //Data isn't going in untracked. Potentially dangerous.
                if ((await story.addImage(sendPackage)) === -1)
                {
                    console.log(`DB Error inserting for image key ${newKey}`);
                    return res.status(500).json({ error: "Internal server error" });
                }
        
                //Return the new S3 link url
                return res.status(201).json({ imageUrl: newKey });
            }
        }
    )
});

router.get("/image/:id", async (req, res) =>
{
    let ID = req.params.id;

    if (!ID)
        return res.status(400).json({ error: "Invalid request paramaters" });
  
    ID = parseInt(ID);

    //Get the name of the image
    let Submission = await story.getSubmissionURLByName(ID);

    if (!Submission)
        return res.status(404).json({ error: "Submission not found in DB" });

    if (!Submission.active && Submission.userId != req.userId)
        return res.status(403).json({ error: "You do not have access to this resource" });

    s3.getObject(
        {
            Bucket: "storysquad",
            Key: Submission.image
        }).on("httpHeaders", function(statusCode, headers) 
    {
        res.set("Content-Length", headers["content-length"]);
        res.set("Content-Type", headers["content-type"]);
        res.set("Cache-control", "private, max-age=86400");
        this.response.httpResponse.createUnbufferedStream().pipe(res);
        res.status(statusCode);
    }).on("error", function (err)
    {
        console.log(err);
        return res.status(400).json({ error: "Error finding file specified" });
    }).send();
});

router.get('/video', restricted(), async (req, res) => 
{
    const video = await story.getVideo();
    const returnPackage = {
        video_id: video.video_id,
        video_link: video.video_link
    }
    // Console.log(video)
    return res.json({ returnPackage });
})

router.get("/prompt", restricted(false), async (req, res) => 
{
    const prompt = await story.getPrompt();
    if (!prompt)
        return res.status(500).json({ error: 'Something went wrong.' });
    else 
    {
        let submitted = false;
        if (req.userId) submitted = await story.hasSubmitted(req.userId);

        return res.status(200).json({ prompt: prompt.prompt, active: prompt.active, submitted });
    }
})

router.get('/all_prompts', adminRestricted, async (req, res) => 
{
    const prompts = await story.allPrompts();
    if (!prompts) 
    {
        return res.status(500).json({ error: "Something went wrong." })
    }
    else 
    {
        return res.json(prompts)
    }
})

router.get('/mytopstories', restricted(), async (req, res) => 
{
    const submissions = await story.top5SubmissionsByUser(req.userId);
    if (!submissions)
        return res.status(404).json({ error: "No submissions found for the user with that id" });
    else
        return res.status(200).json(submissions);
});

router.put('/edit/:id', adminRestricted, (req, res) => 
{
    // There needs to be id and edits in req packet
    console.log(req.body)
    if (req.params.id && req.body.prompt) 
    {
        story.editPrompt(req.body, req.params.id).then(() => 
        {
            return res.status(200).json({ message: `Prompt ${req.id} was edited successfully.` })
        }).catch(err => console.log(err));
    }
    else 
    {
        return res.status(400).json({ error: "You need to supply the ID and text to edit writing prompt." })
    }
})

router.post('/add', adminRestricted, (req, res) => 
{
    console.log(req.body)
    if (req.body.prompt) 
    {
        story.addPrompt(req.body).then(() => 
        {
            return res.status(200).json({ message: "Prompt added" })
        }).catch(err => console.log(err));
    }
    else 
    {
        return res.status(400).json({ error: "You must add writing prompt text to add a prompt." })
    }
})

module.exports = router;