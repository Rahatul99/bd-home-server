const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5001;
//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jp6ok1r.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const newsCollection = await client.db("bdHome").collection("news");

    app.get("/news", async (req, res) => {
      const cursor = newsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/addNew", async (req, res) => {
      const addNew = req.body;
      const result = await newsCollection.insertOne(addNew);
      res.send(result);
    });

    app.put("/updateNews/:id", async (req, res) => {
      console.log(req.params.id, "hit");
      const id = req.params.id;
      const body = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          name: body.name,
          category: body.category,
          link: body.link,
        },
      };

      try {
        const result = await newsCollection.updateOne(filter, updateDoc);
        if (result.modifiedCount > 0) {
          const updateNews = await newsCollection.findOne(filter);
          res.send(updateNews);
          console.log(updateNews);
        } else {
          res.status(404).send("News not found");
        }
      } catch (error) {
        console.error("Error updating news:", error);
        res.status(500).send("An error occurred");
      }
    });

    app.delete("/deleteNews/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      try {
        const result = await newsCollection.deleteOne(filter);
        if (result.deletedCount > 0) {
          res.send({ message: "News deleted successfully" });
        } else {
          res.status(404).send({ message: "News not found" });
        }
      } catch (error) {
        console.error("Error deleting news:", error);
        res.status(500).send({ message: "An error occurred" });
      }
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
  //   finally {
  //     await client.close();
  //   }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("hello world");
});

app.listen(port, () => {
  console.log(`the server start on port ${port}`);
});
