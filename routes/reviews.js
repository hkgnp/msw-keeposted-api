// Set up router
const router = require("express").Router();

// Set up bcrypt
const bcrypt = require("bcryptjs");

// Set up Mongo
require('dotenv').config(); // Not needed for Heroku
const mongoUrl = process.env.MONGO_URL;
const MongoUtil = require('../MongoUtil');
const ObjectId = require('mongodb').ObjectId;

// Router for posting comments
router.post("/reviews", async (req, res) => {
    const DBNAME = 'msw-keeposted';
    let db = await MongoUtil.connect(mongoUrl, DBNAME);
    const { name, email, comments } = req.body;

    // Actually send comments
    try {
        await db.collection('users').insertOne({
            name: name,
            email: email,
            comments: comments,
            date: new Date(),
        });
        res.status(200);
    } catch (e) {
        res.status(500);
        res.send({
            message: 'Unable to post review. Please try again.',
        });
        console.log(e);
    }

})

module.exports = router;