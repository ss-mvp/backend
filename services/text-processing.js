const fs = require("fs");
const Vision = require("@google-cloud/vision");
const Readability = require("./readability-score");

async function TranscribeImage(ImageBuffer)
{
    try
    {
        //Hack to avoid having to place a file on every server
        fs.writeFileSync("vision.json", JSON.stringify(JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS)));

        //Initialize the vision client
        let Client = new Vision.ImageAnnotatorClient({ keyFile: "vision.json" });

        let Transcribe = (await Client.textDetection(ImageBuffer))[0];

        if (!Transcribe.textAnnotations[0])
            return "No text found";
        
        return Transcribe.textAnnotations[0].description.replace(/\r?\n|\r/g, " ");
    }
    catch (ex)
    {
        console.log(ex);
        return "Error090";
    }
}

function ScoreImage(Transcription)
{
    let Item = Readability.getScores(Transcription);

    return Item;
}

function Flagged(Transcription)
{
    return { flagged: false, terms: "" };
}

//ImageData must be a buffer. Returns:
/*
{
    transcription: String
    readability: Score object
    flagged: Flag object
}
*/
async function TextProcess(ImageData)
{
    let Transcription = await TranscribeImage(ImageData);

    if (Transcription === "Error090")
        return undefined;

    let Score = ScoreImage(Transcription);

    let Accumulative = 0;

    Object.keys(Score).forEach((i) =>
    {
        Accumulative += Score[i];
    });

    Score.ranking_score = Accumulative;

    return { transcription: Transcription, readability: Score, flagged: Flagged(Transcription) };
}

module.exports = {
    TextProcess
}