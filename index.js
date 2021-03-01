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
const S3_BUCKET = process.env.S3_BUCKET;
aws.config.region = 'ap-southeast-1';

// Set up express app
let app = express();

// Add in app.use for json and cors
app.use(express.json());
app.use(cors());

// Main api
main = async () => {
  const DBNAME = 'msw-keeposted';
  let db = await MongoUtil.connect(mongoUrl, DBNAME);

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

  // GET IMAGES FROM S3
  app.get('/sign-s3', (req, res) => {
    const s3 = new aws.S3();
    const fileName = req.query['file-name'];
    const fileType = req.query['file-type'];
    const s3Params = {
      Bucket: S3_BUCKET,
      Key: fileName,
      Expires: 60,
      ContentType: fileType,
      ACL: 'public-read',
    };

    s3.getSignedUrl('putObject', s3Params, (err, data) => {
      if (err) {
        console.log(err);
        return res.end();
      }
      const returnData = {
        signedRequest: data,
        url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`,
      };
      res.write(JSON.stringify(returnData));
      res.end();
    });
  });

  // POST
  app.get('/posts', async (req, res) => {
    let title = req.body.title;
    let category = req.body.category;
    let description = req.body.description;

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

  // DELETE
  //PUT
};
main();

app.listen(process.env.PORT || 7000, () =>
  console.log('Server is running on port 7000 ...')
);
