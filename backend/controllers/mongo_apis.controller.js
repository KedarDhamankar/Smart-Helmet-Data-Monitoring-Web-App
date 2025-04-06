const SensorReading = require('../models/sensor_data.model.js');
const ImageDataSchema = require('../models/image_data.model.js')

const addSensorReadingInDB = async (req, res) => {
    try {
        const sensor_reading_object = await SensorReading.create({
            sensor_type: req.body.sensor_type,
            sensor_reading: req.body.sensor_reading
        })

        // Lazy importing socket io object
        const io = require('../index.js');

        // Emit Data to Connected Clients
        io.emit(req.body.sensor_type, sensor_reading_object);

        res.status(200).json(sensor_reading_object);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const getLatestSensorReadingFromDB = async (req, res) => {
    try {
        const { sensor_type } = req.params;
        const result = await SensorReading.findOne({ "sensor_type": sensor_type }).sort({ createdAt: -1 });
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getHistoricalSensorData = async (req, res) => {
    try {
        const { sensor_type, limit } = req.params;
        const limit_count = parseInt(limit) || 12; // Default to 12 data points if not specified

        const results = await SensorReading.find({ "sensor_type": sensor_type })
            .sort({ createdAt: -1 }) // Get newest first
            .limit(limit_count);

        // Return in chronological order (oldest first)
        res.status(200).json(results.reverse());
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const postImageData = async (req, res) => {
    try {
        const base64_image_data = req.body;
        console.log(req.body);

        const base64_image_data_object = await ImageDataSchema.create({
            base64_image: base64_image_data
        });

        // Lazy importing socket io object
        const io = require('../index.js');

        io.emit("New image received");

        res.status(200).json({ "base64 image data in db": base64_image_data_object });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getImageData = async (req, res) => {
    try {
        const base64_image_data_object = await ImageDataSchema.findOne({}).sort({ createdAt: -1 })
        res.status(200).json(base64_image_data_object);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { addSensorReadingInDB, getLatestSensorReadingFromDB, getHistoricalSensorData, postImageData, getImageData };