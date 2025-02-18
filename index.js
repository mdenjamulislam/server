const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();

const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.g2de0pv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const serviceCollection = client.db('carDoctor').collection('Services');
        const teamCollection = client.db('carDoctor').collection('teams');
        const bookingCollection = client.db('carDoctor').collection('booking');

        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        });

        // get all service title
        app.get('/services/title', async (req, res) => {
            const cursor = serviceCollection.find({});
            const services = await cursor.toArray();
            const titlesWithId = services.map(service => ({ _id: service._id, title: service.title }));
            res.send(titlesWithId);
        });


        // get individual service
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        });

        // get a service for chekout
        app.get('/checkout/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const options = { projection: { title: 1, price: 1, service_id: 1, img: 1 } };
            const service = await serviceCollection.findOne(query, options);
            res.send(service);
        });


        // get all teams
        app.get('/teams', async (req, res) => {
            const cursor = teamCollection.find({});
            const teams = await cursor.toArray();
            res.send(teams);
        });

        // booking
        app.post('/booking', async (req, res) => {
            const booking = req.body;
            const result = await bookingCollection.insertOne(booking);
            res.send(result);
        });

        app.get('/booking', async (req, res) => {
            let query = {};
            if (req.query?.email) {
                query = {email: req.query.email}
            }
            const cursor = bookingCollection.find(query);
            const booking = await cursor.toArray();
            res.send(booking);
        });
        
        


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Server is running');
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});