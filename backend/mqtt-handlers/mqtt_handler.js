const mqtt_client = require('../config/mqtt.js');

mqtt_client.on('message', async (topic, message) => {
    try {
        const messageString = message.toString();
        const messageJSON = JSON.parse(messageString);
        // console.log(messageJSON);
        const mongo_response = await fetch('http://localhost:3000/mongo/sensor/data', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(messageJSON)
        })

        const responseData = await mongo_response.json();
        console.log("Data stored in DB.");
    } catch (error) {
        console.error("Error processing MQTT message:", error);
    }
});

mqtt_client.on('error', (error) => {
    console.error('MQTT Error:', error);
});