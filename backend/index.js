const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
require("dotenv").config();

require('./config/mqtt.js');
require('./mqtt-handlers/mqtt_handler.js');
const mongo_apis_routes = require('./routes/mongo_apis.route')

const app = express();

// Enable CORS to allow React App
app.use(cors());

// Middleware
app.use(express.json()); // to allow express to parse json data as input

// Connecting to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Connected to database!");
        const server = app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`)
        });

        const io = new Server(server, { cors: { origin: "*" } }); // Create Socket.io server

        // Socket.io Connection Handling
        io.on('connection', (socket) => {
            console.log("New client connected:", socket.id);

            socket.on("disconnect", () => {
                console.log("Client disconnected:", socket.id);
            });
        });

        module.exports = io;
    })
    .catch(() => {
        console.log("Connection to db failed.");
    })


// API Routes
app.use(mongo_apis_routes);
