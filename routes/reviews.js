// Set up router
const router = require('express').Router();

// Set up Mongo
require('dotenv').config(); // Not needed for Heroku
const mongoUrl = process.env.MONGO_URL;
const MongoUtil = require('../MongoUtil');
const ObjectId = require('mongodb').ObjectId;
const DBNAME = 'msw-keeposted';

// Router for getting comments based on Objectid
router.post('/get', async (req, res) => {
  let db = await MongoUtil.connect(mongoUrl, DBNAME);
  const { _id } = req.body;

  // Get comments based on filter
  try {
    const result = await db
      .collection('reviews')
      .find({
        "postId": ObjectId(_id),
      })
      .toArray();
    res.status(200);
    res.send(result);
  } catch (e) {
    res.status(500);
    res.send({
      message: 'Unable to find reviews.',
    });
    console.log(e);
  }
});

router.post('/post', async (req, res) => {
  let db = await MongoUtil.connect(mongoUrl, DBNAME);
  const { name, review, postId } = req.body;

  try {
    await db.collection('reviews').insertOne({
      "name": name,
      "review": review,
      "date": new Date(),
      "postId": ObjectId(postId),
    });
    res.status(200);
    res.send('Review submitted successfully');
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
