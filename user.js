const router = require("express").Router();
const bcrypt = require("bcryptjs");

require('dotenv').config(); // Not needed for Heroku
const mongoUrl = process.env.MONGO_URL;
const MongoUtil = require('./MongoUtil');
const ObjectId = require('mongodb').ObjectId;

router.post("/register", async (req, res) => {
        // API to link with MongoDB
    const DBNAME = 'msw-keeposted';
    let db = await MongoUtil.connect(mongoUrl, DBNAME);
    const { name, email, password } = req.body;
    const duplicateEmail = await db.collection('users').findOne({ email: email });

    // Check for duplicate email
    if (duplicateEmail) {
        res.status(400)
        res.send("Username has already been taken")
    }

    // Hash password before sending to Mongo
    const salt = await bcrypt.genSalt(8);
    const hashPassword = await bcrypt.hash(password, salt);

    // Actually register
    try {
        const savedUser = await db.collection('users').insertOne({
            name: name,
            email: email,
            password: hashPassword,
            date: new Date(),
        });
        res.status(200);
        res.json({ error: null, data: savedUser });
    } catch (e) {
        res.send(e);
        console.log(e);
    }



});

module.exports = router;