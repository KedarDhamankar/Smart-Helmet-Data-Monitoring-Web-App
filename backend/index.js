const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
require("dotenv").config();

require('./config/mqtt.js');
require('./mqtt-handlers/mqtt_handler.js');
const mongo_apis_routes = require('./routes/mongo_apis.route')

const app = express();
const io = new Server(3001, { cors: { origin: "*" } }); // Create Socket.io server

// Enable CORS to allow React App
app.use(cors());

// Middleware
app.use(express.json()); // to allow express to parse json data as input

// Connecting to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Connected to database!");
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`)
        });
    })
    .catch(() => {
        console.log("Connection to db failed.");
    })

// Socket.io Connection Handling
io.on('connection', (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

// API Routes
app.use(mongo_apis_routes);

module.exports = io;