const { default: Axios } = require("axios");

async function TextProcess(file_key, checksum)
{
    try
    {
        return (await Axios.post(
            `${process.env.DS_API_URL}/submission/text`,
            {
                "SubmissionID": 0,
                "StoryId": 0,
                "Pages":
                {
                    "1":
                    {
                        "filekey": file_key,
                        "Checksum": checksum
                    }
                }
            },
            {
                headers:
                {
                    "Authorization": process.env.DS_API_KEY
                }
            }
        )).data;
    }
    catch (ex)
    {
        console.log(ex);
        return false;
    }
}

module.exports = {
    TextProcess
}