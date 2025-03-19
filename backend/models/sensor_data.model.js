const mongoose = require('mongoose');

const SensorDataSchema = mongoose.Schema(
    {
        sensor_type: {
            type: String,
            required: [true, "Sensor name missing."]
        },
        sensor_reading: {
            type: Number,
            required: [true, "Sensor reading missing."]
        },
    },
    { timestamps: true }
)

const SensorReading = mongoose.model("Sensor Reading", SensorDataSchema);
module.exports = SensorReading;