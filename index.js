// 1. When user clicks submit, Mongo API to 'post-details' is triggered and form body (except media) is sent to Mongo.
// 2. Object ID is returned.
// 3. Use Object ID to form the filename of the file to upload to S3.
// 4. Use S3 URL of file to trigger another Mongo API to 'media' collections.

//////////////////////////////////////////////////////////
//////////////////// BASIC SETUP /////////////////////////
//////////////////////////////////////////////////////////

// Implement basic requirements
const express = require('express');
const cors = require('cors')

// For Mongo
require('dotenv').config(); // Not needed for Heroku
const mongoUrl = process.env.MONGO_URL;
const MongoUtil = require('./MongoUtil');
const ObjectId = require('mongodb').ObjectId;

// For AWS
const aws = require('aws-sdk');
const accessKeyId = process.env.S3_ACCESS_KEY;
const secretAccessKey = process.env.S3_ACCESS_SECRET;
aws.config.region = 'ap-southeast-1';

// Set up express app
let app = express();

// Add in app.use for json and cors
app.use(express.json());
app.use(cors());

const s3 = new aws.S3({
    region: 'ap-southeast-1',
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
});

//////////////////////////////////////////////////////////
/////////////////////// MAIN API /////////////////////////
//////////////////////////////////////////////////////////

let main = async () => {
    // API to get the signedUrl from S3
    app.get('/uploader/sign', async (req, res) => {
        try {
            const key = req.query.key;
            const type = req.query.type;
            const url = s3.getSignedUrl('putObject', {
                Bucket: 'msw-keeposted-images',
                Key: key,
                Expires: 60,
                ContentType: type,
            });
            res.send({ url });

        } catch (e) { console.log(e) }

    });

    // API to link with MongoDB
    const DBNAME = 'msw-keeposted';
    let db = await MongoUtil.connect(mongoUrl, DBNAME);

    // POST
    app.post('/posts', async (req, res) => {
        let { title, category, description, location } = req.body;

        try {
            let result = await db.collection('post-details').insertOne({
                title: title,
                category: category,
                description: description,
                location: location,
            });
            res.status(200);
            // res.send(result.insertId)
            // res.send({
            //     "_id": 'ObjectId("' + result.insertedId + '")'
            // });
            res.send('ObjectId("' + result.insertedId + '")')
            
        } catch (e) {
            res.status(500);
            res.send({
                message: 'Unable to consume API successfully.',
            });
            console.log(e);
        }
    });

    // GET
    app.get('/posts', async (req, res) => {
        try {
            let result = await db.collection('post-details').find({}).toArray();
            res.status(200);
            res.send(result);
        } catch (e) {
            res.status(500);
            res.send({
                message: 'Unable to consume API successfully.',
            });
            console.log(e);
        }
    });

    // DELETE
    //PUT
};

main();

app.listen(process.env.PORT || 7000, () =>
    console.log('Server is running on port 7000 ...')
);


