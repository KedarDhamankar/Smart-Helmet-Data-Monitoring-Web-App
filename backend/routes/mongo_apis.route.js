const express = require('express');
const router = express.Router();
const { addSensorReadingInDB, getLatestSensorReadingFromDB, getHistoricalSensorData } = require("../controllers/mongo_apis.controller.js");

router.post('/mongo/sensor/data', addSensorReadingInDB);
router.get('/mongo/sensor/data/:sensor_type', getLatestSensorReadingFromDB);
router.get('/mongo/sensor/data/history/:sensor_type/:limit', getHistoricalSensorData);

module.exports = router;