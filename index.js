// Notes
// Collections:
// 1. Posts
// 2. Users
// 3. Addresses

// Implement requirements
const express = require('express');
const MongoUtil = require('./MongoUtil');
const mongoUrl = process.env.MONGO_URL;
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
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

// Main api
let main = async () => {
  // API to get the signedUrl from S3
  app.get('/uploader/sign', async (req, res) => {
    const key = req.query.key;
    const type = req.query.type;
    const url = s3.getSignedUrl('putObject', {
      Bucket: 'msw-keeposted-images',
      Key: key,
      Expires: 60,
      ContentType: type,
    });
    res.send({ url });
  });

  const DBNAME = 'msw-keeposted';
  let db = await MongoUtil.connect(mongoUrl, DBNAME);

  // POST
  app.post('/posts', async (req, res) => {
    let { title, category, description } = req.body;

    try {
      let result = await db.collection('post-details').insertOne({
        title: title,
        category: category,
        description: description,
        location: location,
      });
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
