const aws = require('aws-sdk');
// const multer = require('multer');
// const multerS3 = require('multer-s3');
const dotenv = require('dotenv');
dotenv.config();

aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: 'us-east-1'
});

const s3 = new aws.S3();

// const upload = multer({
//     storage: multerS3({
//         s3: s3,
//         bucket: 'storysquad',
//         acl: 'public-read',
//         metadata: function(req, file, cb) {
//             cb(null, {fieldName: 'Testing Metadata'});
//         },
//         key: function(req, file, cb) {
//             cb(null, Date.now().toString())
//         }
//     })
// })

module.exports = s3;