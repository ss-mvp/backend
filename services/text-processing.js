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

        let Transcribe = (await Client.textDetection(
            {
                image: ImageBuffer,
                imageContext:
                {
                    languageHints: ["en-t-i0-handwrit"]
                }
            }
        ))[0];

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

    Item.quoteCount = Transcription.split('"').length - 1;
    Item.doc_length = Transcription.length;

    return Item;
}

function Flagged(Transcription)
{
    //Check singles
    let bad_terms = "";

    {
        const Singles = (fs.readFileSync("./data/resources/bad_single.csv")).toString().split(",\r\n");
        const Words = Transcription.toLowerCase().split(" ");

        for (let i = 0; i < Singles.length; i++)
            for (let e = 0; e < Words.length; e++)
                if (Singles[i] === Words[e])
                    bad_terms += Singles[i] + ",";
    }

    //Check phrases
    {
        const Phrases = (fs.readFileSync("./data/resources/bad_phrases.csv")).toString().split(",\r\n");
        
        for (let i = 0; i < Phrases.length; i++)
            if (Transcription.includes(Phrases[i]))
                bad_terms += Phrases[i] + ",";
    }

    return { flagged: bad_terms.length !== 0, terms: bad_terms };
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
    
    if (Transcription === "Error090" || Transcription === "No text found")
        return { transcription: undefined, readability: undefined, flagged: undefined }; // Do not ask
    
    let Score = ScoreImage(Transcription);

    let Accumulative = 0;

    Object.keys(Score).forEach((i) =>
    {
        if (i !== "doc_length")
            Accumulative += Score[i];
    });

    Score.ranking_score = Accumulative;

    return { transcription: Transcription, readability: Score, flagged: Flagged(Transcription) };
}

module.exports = {
    TextProcess
}