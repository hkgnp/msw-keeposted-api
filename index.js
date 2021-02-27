// Implement requirements
const express = require('express')
const MongoUtil = require('./MongoUtil')
const mongoUrl = process.env.MONGO_URL;
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors')

// Set up express app
let app = express()

// Add in app.use for json and cors
app.use(express.json());
app.use(cors());

// Main api
main = async () => {
    const DBNAME = 'msw-keeposted';
    let db = await MongoUtil.connect(mongoUrl, DBNAME);

// GET
app.get('/posts', async (req,res) => {
    try {
        let result = await db.collection('posts').find({}).toArray();
        res.send(result)
    } catch (e) {
        res.send('Apologies, API was not consumed successfully.')
    }
})
// POST
// DELETE
//PUT

}
main();

app.listen(process.env.PORT || 3000, () => console.log('Server is running on port 3000 ...'));