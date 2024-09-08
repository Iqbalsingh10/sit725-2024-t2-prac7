const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
const app = express();

const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));
app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://iqbalsingh:iqbal9988@cluster0.cpxazrb.mongodb.net";
const client = new MongoClient(uri);

let db;
let collection;

// MongoDB connection function
async function connectToMongoDB() {
      try {
            await client.connect();
            console.log("Connected to MongoDB");

            db = client.db("Collection_Users");
            collection = db.collection("Users");
      } catch (error) {
            console.error("Error connecting to MongoDB:", error);
      }
}

// Example API endpoint to add two numbers
const addTwoNumber = (n1, n2) => {
      return n1 + n2;
};
app.get("/addTwoNumber", (req, res) => {
      const n1 = parseInt(req.query.n1);
      const n2 = parseInt(req.query.n2);
      const result = addTwoNumber(n1, n2);
      res.json({ statusCode: 200, data: result });
});

// Sign up endpoint
app.post("/signup", async (req, res) => {
      if (!collection) {
            return res.status(500).json({ message: "MongoDB connection not established" });
      }

      const { email, password } = req.body;

      try {
            const existingUser = await collection.findOne({ email });

            if (existingUser) {
                  if (existingUser.password === password) {
                        res.json({
                              statusCode: 200,
                              message: "Welcome Back",
                        });
                  } else {
                        res.status(400).json({
                              statusCode: 400,
                              message: "Incorrect password",
                        });
                  }
            } else {
                  const result = await collection.insertOne({
                        email,
                        password,
                  });
                  res.json({
                        statusCode: 200,
                        message: "User signed up successfully",
                        id: result.insertedId,
                  });
            }
      } catch (error) {
            console.error("Error signing up:", error);
            res.status(500).json({
                  statusCode: 500,
                  message: "Error signing up",
                  error: error.message,
            });
      }
});

// Get data endpoint
app.get("/getData", (req, res) => {
      if (!collection) {
            return res.status(500).json({ message: "MongoDB connection not established" });
      }
      collection
            .find({})
            .toArray()
            .then((documents) => {
                  res.json({ statusCode: 200, data: documents });
            })
            .catch((error) => {
                  console.error("Error fetching documents:", error);
                  res.status(500).json({
                        statusCode: 500,
                        message: "Error fetching documents",
                        error: error.message,
                  });
            });
});
// Display HTML content
app.get("/Display", (req, res) => {
      const htmlContent = "<html><body><H1>HELLO THERE</H1></body></html>";
      res.set("Content-Type", "text/html");
      res.send(Buffer.from(htmlContent));
});

// WebSocket event handling
io.on("connection", (socket) => {
      // console.log("A user connected:", socket.id);
      console.log("Total number of connected clients: " + io.sockets.sockets.size);

      socket.on("message", (data) => {
            console.log("Message received from client:", data);
            socket.emit("serverMessage, Server received your message: " + data);
      });

      socket.on("disconnect", () => {
            // console.log("A user disconnected:", socket.id);
            console.log("A user disconnected:");
      });

      setInterval(() => {
            let random_number = parseInt(Math.random() * 10);
            console.log(random_number);
            socket.emit("number", random_number);
      }, 1000);
});
// Start the server only after MongoDB is connected
async function startServer() {
      await connectToMongoDB();
      const port = 3040;
      server.listen(port, () => {
            console.log("Server is listening on port " + port);
      });
}

startServer();