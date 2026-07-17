const mqtt = require('mqtt');
const axios = require('axios');

const BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://mosquitto:1883';
const TOPIC = process.env.MQTT_TOPIC || 'plc/#';
const DB_SERVICE_URL = process.env.DB_SERVICE_URL || 'http://db-service:8001';

console.log('MQTT service starting', { BROKER_URL, TOPIC, DB_SERVICE_URL });

const client = mqtt.connect(BROKER_URL);

client.on('connect', () => {
  console.log('Connected to MQTT broker');
  client.subscribe(TOPIC, (err) => {
    if (err) console.error('Subscribe error', err);
    else console.log('Subscribed to', TOPIC);
  });
});

client.on('message', async (topic, message) => {
  try {
    const payloadStr = message.toString();
    let values;
    try {
      values = JSON.parse(payloadStr);
    } catch (_) {
      // if not JSON, store raw message
      values = { raw: payloadStr };
    }

    // derive plc_id from topic last segment
    const parts = topic.split('/');
    const plcId = parts[parts.length - 1] || topic;

    const record = {
      plc_id: plcId,
      host: 'mqtt',
      port: 1883,
      unit_id: 0,
      values,
    };

    const res = await axios.post(`${DB_SERVICE_URL}/records`, record, { timeout: 5000 });
    console.log('Saved record from', topic, 'id:', res.data.id);
  } catch (err) {
    console.error('Failed processing message', err.message || err);
  }
});

client.on('error', (err) => {
  console.error('MQTT client error', err.message || err);
});
