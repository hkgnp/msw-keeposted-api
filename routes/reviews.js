// Set up router
const router = require('express').Router();

// Set up Mongo
require('dotenv').config(); // Not needed for Heroku
const mongoUrl = process.env.MONGO_URL;
const MongoUtil = require('../MongoUtil');
const ObjectId = require('mongodb').ObjectId;

// Router for getting comments based on Objectid
router.post('/get', async (req, res) => {
  const DBNAME = 'msw-keeposted';
  let db = await MongoUtil.connect(mongoUrl, DBNAME);
  const { _id } = req.body;

  // Get comments based on filter
  try {
    const result = await db
      .collection('users')
      .find({
        postId: ObjectId(_id),
      })
      .toArray();
    res.status(200);
    res.send(result);
  } catch (e) {
    res.status(500);
    res.send({
      message: 'Unable to find comments.',
    });
    console.log(e);
  }
});

module.exports = router;
