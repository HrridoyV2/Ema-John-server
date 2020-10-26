const express = require('express')
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const admin = require("firebase-admin");
const MongoClient = require("mongodb").MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xya9j.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {useNewUrlParser: true,useUnifiedTopology: true,});

const stripe = require("stripe")(
  "sk_test_51HfO7aFEbSKa9C2S7wnYkBXsaUWInXLvEZMvVMx9CByv1OZBbEVtFjYOUzMD7KQmBtAzGkNv4AuaaFjiElxW4VYC00HEOlLw9S"
);
const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

const port = 5000

app.get('/', (req, res) => {
  res.send('Hello World!')
})
//  
  app.post("/payments/create", async (request, response) => {
    const Total = Math.round(request.query.total);
    console.log("Payment request received BOOM !!! for this amound >> ", Total);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Total, // subunits of the currenc
      currency: "usd",
    });

    // ok - created
    response.status(201).send({
      clientSecret: paymentIntent.client_secret,
    });
  });
//
  


const serviceAccount = require("./Config/fir-ba4c3-firebase-adminsdk-jzert-83a5575e34.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://fir-ba4c3.firebaseio.com"
});

//
client.connect((err) => {
  const productsCollection = client.db("emaJohnStore").collection("Products");
  const ordersCollection = client.db("emaJohnStore").collection("Orders");
  // 
    app.get('/products', (req, res) => {
      productsCollection.find({})
      .toArray((err, documents) =>{
        res.send(documents)
      })
    })
  //
    app.get("/product/:id", (req, res) => {
      productsCollection.find({ key: req.params.id })
      .toArray((err, documents) => {
      res.send(documents[0]);
        });
    });
  //
  app.post('/addOrder', (req, res) => {
    const order = req.body;
    ordersCollection.insertOne(order)
    .then((result) => {
      res.send(result.insertedCount > 0)
    })
  })
  //
    app.get('/orderData', (req, res) => {
      const bearer = req.headers.authorization;
      if(bearer && bearer.startsWith('Bearer ')){
        const idToken = bearer.split(' ')[1];
        console.log({idToken});
        admin
          .auth()
          .verifyIdToken(idToken)
          .then((decodedToken) => {
            const tokenEmail = decodedToken.email;
            const queryEmail = req.query.email;
            console.log(queryEmail, tokenEmail);
            if(tokenEmail == queryEmail){
              ordersCollection
                .find({ email: queryEmail })
                .toArray((err, documents) => {
                  res.send(documents);
                });
            }
          })
          .catch((error) => {});
      }


      

    })
  // perform actions on the collection object
  console.log('db connected');
});

//
app.listen(process.env.PORT || port)
