const mqtt = require('mqtt');

// Connecting to mqtt broker
const options = {
    username: "desktop-client",
    password: "Hivemq123",
    protocol: "wss",  // WebSocket Secure
    port: 8884,
};

// const mqtt_client = mqtt.connect(`${options.protocol}://42e86177f589408a8230bd7a8d3aff12.s1.eu.hivemq.cloud:8884/mqtt`, options);
const mqtt_client = mqtt.connect('mqtt://broker.emqx.io:1883');

try {

    mqtt_client.on('connect', () => {
        console.log('Connected to MQTT broker');

        mqtt_client.subscribe('vjti', (err) => {
            if (!err) {
                console.log('Subscribed to vjti');
            } else {
                console.error('Subscription error:', err);
            }
        });
    });

    mqtt_client.on('error', (error) => {
        console.error('MQTT Error:', error);
    });
} catch (error) {
    console.log(error.message);
}

module.exports = mqtt_client;