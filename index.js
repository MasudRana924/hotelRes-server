const express = require('express')
const { MongoClient } = require('mongodb');
const fileUpload = require('express-fileupload');
const ObjectId = require('mongodb').ObjectId
const cors = require('cors');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000
// middleware 
app.use(cors())
app.use(express.json())
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hrpwo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {

    try {
        await client.connect()
        console.log('database connected')
        const database = client.db('hotelRes')
        const usersCollection = database.collection('users')
        const hotelsCollection = database.collection('hotels')
        const bookingsCollection = database.collection('bookings')
        const reviewsCollection = database.collection('reviews')

        //     get data section
        app.get('/hotels', async (req, res) => {
            const cursor = hotelsCollection.find({})
            const hotels = await cursor.toArray()
            res.send(hotels)

        })
         app.get('/hotels/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const hotels = await hotelsCollection.findOne(query)
            res.json(hotels)
        })

        // users section 
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result)
        })
        app.get('/usersemail', async (req, res) => {
            const email = req.query.email
            const query = { email: email }
            console.log(query)
            const cursor = usersCollection.find(query)
            const users = await cursor.toArray()
            res.send(users)

        })
        app.put('/updateuser', async (req, res) => {
            const email = req.query.email
            const filter = { email: email };
            const option = { upsert: true }
            const name = req.body.name;
            const phone = req.body.phone;
            const address = req.body.address;
            const pic = req.files.image;
            const picData = pic.data;
            const encodedPic = picData.toString('base64');
            const imageBuffer = Buffer.from(encodedPic, 'base64');
           
            const updateDoc = {
                $set: {
                    displayName:name,
                    phoneno: phone,
                    adddress:address,
                    image:imageBuffer
                }
            }
            const result = await usersCollection.updateOne(filter, updateDoc, true)
            res.json(result)
            console.log(result)

        })

        // Bookings section
        app.post('/bookings', async (req, res) => {
            const bookings = req.body;
            const result = await bookingsCollection.insertOne(bookings);
            res.json(result)
        })
        app.get('/mybookings', async (req, res) => {
            const email = req.query.email
            const query = { email: email }
            const cursor = bookingsCollection.find(query)
            const orders = await cursor.toArray()
            res.send(orders)

        })
        app.delete('/mybookings/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await bookingsCollection.deleteOne(query)
            res.json(result)
        })

        //   reviews 
        //    post api 
        app.post('/reviews', async (req, res) => {
            const rating = req.body.rating;
            const review = req.body.review;
            const pic = req.files.image;
            const picData = pic.data;
            const encodedPic = picData.toString('base64');
            const imageBuffer = Buffer.from(encodedPic, 'base64');
            const setreviews = {
                review,
                rating,
                image: imageBuffer
            }
            const result = await reviewsCollection.insertOne(setreviews);
            res.json(result);
        })
        app.get('/getreviews', async (req, res) => {
            const cursor = reviewsCollection.find({})
            const reviews = await cursor.toArray()
            res.send(reviews)
        })
    }
    finally {
    }
}
run().catch(console.dir)
app.get('/', (req, res) => {
    res.send('hotelres is running under server')
})
app.listen(port, () => {
    console.log("server is running on", port)
})