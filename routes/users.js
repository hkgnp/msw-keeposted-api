// Set up router
const router = require('express').Router();

// Set up bcrypt
const bcrypt = require('bcryptjs');

// Set up JWT
const jwt = require('jsonwebtoken');

// Set up Mongo
require('dotenv').config(); // Not needed for Heroku
const mongoUrl = process.env.MONGO_URL;
const MongoUtil = require('../MongoUtil');
const ObjectId = require('mongodb').ObjectId;

// Router for user registration
router.post('/register', async (req, res) => {
  // API to link with MongoDB
  const DBNAME = 'msw-keeposted';
  let db = await MongoUtil.connect(mongoUrl, DBNAME);
  const { name, email, password } = req.body;

  // Check for duplicate email in Mongo
  const duplicateEmail = await db.collection('users').findOne({ email: email });
  if (duplicateEmail) {
    res.status(400);
    res.send('Username has already been taken');
  }

  // Hash password before sending to Mongo
  const salt = await bcrypt.genSalt(8);
  const hashPassword = await bcrypt.hash(password, salt);

  // Actually register user
  try {
    let result = await db.collection('users').insertOne({
      name: name,
      email: email,
      password: hashPassword,
      date: new Date(),
    });
    res.status(200);
    res.send(result);
  } catch (e) {
    res.status(500);
    res.send({
      message: 'Unable to complete registration. Please try again.',
    });
    console.log(e);
  }
});

//Router for Update
router.put('/update', async (req, res) => {
  const { name, email, id } = req.body;
  await db.collection('users').updateOne(
    {
      _id: ObjectId(id),
    },
    {
      $set: {
        name: name,
        email: email,
      },
    }
  );
});

// Router for Delete

// Router for login
router.post('/login', async (req, res) => {
  // API to link with MongoDB
  const DBNAME = 'msw-keeposted';
  let db = await MongoUtil.connect(mongoUrl, DBNAME);
  const { name, email, password } = req.body;

  // Check for existing email in Mongo
  const user = await db.collection('users').findOne({ email: email });
  if (!user) {
    res.status(400);
    res.send('Username does not exist.');
  }

  // Validate password
  const validPassword = await bcrypt.compare(password, user.password);

  // Login user if password is correct
  if (!validPassword) {
    res.status(400);
    res.send('Password is wrong.');
  } else {
    // Create jwt
    const token = jwt.sign(
      {
        // Payload data
        username: user.email,
        id: user._id,
        name: user.name,
      },
      process.env.TOKEN_SECRET
    );

    // Send the jwt as a response header
    res.header('auth-token', token).json({
      error: null,
      date: {
        token,
      },
    });
  }
});

module.exports = router;
