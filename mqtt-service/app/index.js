const mqtt = require('mqtt');
const axios = require('axios');

const BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://mosquitto:1883';
const TOPIC = process.env.MQTT_TOPIC || 'plc/#';
const DB_SERVICE_URL = process.env.DB_SERVICE_URL || 'http://energy-service:8001';

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
    let payload;
    try {
      payload = JSON.parse(payloadStr);
    } catch (_) {
      // if not JSON, skip
      console.error('Invalid JSON from', topic);
      return;
    }

    const record = {
      _terminalTime: payload.terminalTime || new Date().toISOString(),
      _groupName: payload.groupName || 'datamqtt',
      arus1: payload.arus1 || null,
      arus2: payload.arus2 || null,
      arus3: payload.arus3 || null,
      getaran: payload.vibrasi || null,
      temp: payload.suhu_temp || null,
      tegangan: payload.tegangan || null,
      kwatt: payload.kwatt || null,
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
