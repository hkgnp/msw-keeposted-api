//////////////////////////////////////////////////////////
//////////////////// BASIC SETUP /////////////////////////
//////////////////////////////////////////////////////////

// Implement basic requirements
const express = require('express');
const cors = require('cors');

// For MongoDB
require('dotenv').config(); // Not needed for Heroku
const mongoUrl = process.env.MONGO_URL;
const MongoUtil = require('./MongoUtil');
const ObjectId = require('mongodb').ObjectId;

// For AWS
const aws = require('aws-sdk');
const accessKeyId = process.env.S3_ACCESS_KEY;
const secretAccessKey = process.env.S3_ACCESS_SECRET;
aws.config.region = 'ap-southeast-1';

// import routes
const userRegistration = require('./routes/users');
const resourceReviews = require('./routes/reviews');

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
        } catch (e) {
            console.log(e);
        }
    });

    // API to link with MongoDB
    const DBNAME = 'msw-keeposted';
    let db = await MongoUtil.connect(mongoUrl, DBNAME);

    // Post resource
    app.post('/post-resource', async (req, res) => {
        let { title, categories, description, location, username } = req.body;

        try {
            let result = await db.collection('post-details').insertOne({
                "username": username,
                "title": title,
                "categories": categories,
                "description": description,
                "location": location,
                "date": new Date(),
            });
            res.status(200);
            res.send(result.insertedId);
        } catch (e) {
            res.status(500);
            res.send({
                message: 'Unable to consume API successfully.',
            });
            console.log(e);
        }
    });

    // Post to media
    app.post('/media', async (req, res) => {
        let { postId, mediaUrl } = req.body;
        try {
            await db.collection('media').insertOne({
                "postId": postId,
                "mediaUrl": mediaUrl,
                "date": new Date(),
            });
            res.status(200);
            res.send('File uploaded successfully');
        } catch (e) {
            console.log(e);
        }
    });

    // Edit resource
    app.put('/edit-resource', async (req, res) => {
        let { title, categories, description, location, username, id } = req.body;
        try {
            let result = await db.collection('post-details').updateOne(
                {
                    _id: ObjectId(id),
                },
                {
                    $set: {
                        "username": username,
                        "title": title,
                        "categories": categories,
                        "description": description,
                        "location": location,
                    }
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

    // Get all resources
    app.get('/all-resources', async (req, res) => {
        try {
            let result = await db.collection('post-details').find({}).project({
                "title": 1,
                "categories": 1,
                "description": 1,
                "location": 1,
                "date": 1,
            }).toArray();
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

    // Get one resource
    app.post('/resource', async (req, res) => {
        const { _id } = req.body;
        try {
            let result = await db.collection('post-details').findOne({
                _id: ObjectId(_id)
            }, {
                "title": 1,
                "description": 1,
                "location": 1,
                "date": 1,
                "categories": 1,
                "username": 0
            })
            res.status(200);
            res.send(result)
        } catch (e) {
            res.status(500);
            res.send({
                message: 'Unable to get post'
            })
        }
    })

    // Get resources by username
    app.post('/resource-by-user', async (req, res) => {
        const { username } = req.body;
        try {
            let result = await db.collection('post-details').find({
                username: username
            }, {
                "title": 1,
                "description": 1,
                "location": 1,
                "date": 1,
                "username": 1,
                "categories": 1,

            }).toArray()
            res.status(200);
            res.send(result)
        } catch (e) {
            res.status(500);
            res.send({
                message: 'Unable to get post'
            })
        }
    })

    // Get resources by filter
    app.post('/filter-resource', async (req, res) => {
        let filter = {};
        const { categories } = req.body;

        try {
            let result = await db.collection('post-details').find({
                "categories": {
                    $in: [categories]
                }
            }, {
                "title": 1,
                "description": 1,
                "location": 1,
                "date": 1,
                "username": 0,
                "categories": 1,

            }).toArray()
            res.status(200);
            res.send(result)
        } catch (e) {
            res.status(500);
            res.send({
                message: 'Unable to get post'
            })
        }
    })

    // Delete one resource
    app.delete('/delete-resource', async (req, res) => {
        const { id } = req.body;

        try {
            let result = await db.collection('post-details').removeOne({
                _id: ObjectId(id)
            });
            res.status(200);
            res.send(result);
        } catch (e) {
            res.status(500);
            res.send({
                message: 'Unable to delete successfully.',
            });
            console.log(e);
        }
    });

    // Delete one resource
    app.delete('/delete-resource', async (req, res) => {
        const { id } = req.body;

        try {
            let result = await db.collection('post-details').removeOne({
                postId: ObjectId(id)
            });
            res.status(200);
            res.send(result);
        } catch (e) {
            res.status(500);
            res.send({
                message: 'Unable to delete successfully.',
            });
            console.log(e);
        }
    });

    // Route for user registration / login
    app.use('/user', userRegistration);

    // Route for posting reviews
    app.use('/reviews', resourceReviews);
};

main();

app.listen(process.env.PORT || 7000, () =>
    console.log('Server is running on port 7000 ...')
);
