const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://broker.emqx.io:1883');

client.on('connect', () => {
    console.log('Connected to EMQX MQTT broker');
    client.subscribe('vjti', (err) => {
        if (!err) {
            console.log('Subscribed to vjti');
        } else {
            console.error('Subscription error:', err);
        }
    });
});

client.on('message', (topic, message) => {
    // console.log(`Received message: ${message.toString()} on topic: ${topic}`);
    // console.log(message);
    const stringMessage = message.toString();
    const jsonmessage = JSON.parse(stringMessage);
    console.log(jsonmessage);
});

client.on('error', (error) => {
    console.error('MQTT Error:', error);
});