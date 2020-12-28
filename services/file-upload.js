const aws = require("aws-sdk");
const dotenv = require("dotenv");
dotenv.config();

aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: "us-east-1"
});

const s3 = new aws.S3();

module.exports = s3;