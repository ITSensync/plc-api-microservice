const mqtt = require('mqtt');
const axios = require('axios');
const { sendGasFlow } = require('./gasFlowService');
const { sendRecord } = require('./recordService');

const BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://mosquitto:1883';
const MQTT_TOPICS = (process.env.MQTT_TOPIC || 'plc/#')
  .split(',')
  .map((topic) => topic.trim())
  .filter(Boolean);
const DB_SERVICE_URL = process.env.DB_SERVICE_URL || 'http://energy-service:8001';

console.log('MQTT service starting', { BROKER_URL, MQTT_TOPICS, DB_SERVICE_URL });

const client = mqtt.connect(BROKER_URL);

client.on('connect', () => {
  console.log('Connected to MQTT broker');

  if (MQTT_TOPICS.length === 0) {
    console.error('No MQTT topics configured for subscription');
    return;
  }

  client.subscribe(MQTT_TOPICS, (err, granted) => {
    if (err) {
      console.error('Subscribe error', err);
    } else {
      console.log('Subscribed to topics:', granted.map((topic) => topic.topic).join(', '));
    }
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

    if (topic.startsWith('mqtt/orangepi/gasflowsensor/')) {
      try {
        const result = await sendGasFlow(payload);
        console.log('Forwarded gas flow payload to energy-service', result);
      } catch (err) {
        console.error('Failed to forward gas flow', err.message || err);
      }
      return;
    }

    if (topic.startsWith('data/haiwella8/mtamixer/')) {
      try {
        const result = await sendRecord(payload);
        console.log('Forwarded mtamixer payload to energy-service', result);
      } catch (err) {
        console.error('Failed to forward mtamixer record', err.message || err);
      }
      return;
    }

    /* const record = {
      _terminalTime: payload._terminalTime || new Date().toISOString(),
      _groupName: payload._groupName || 'datamqtt',
      arus1: payload.arus1 || null,
      arus2: payload.arus2 || null,
      arus3: payload.arus3 || null,
      getaran: payload.vibrasi_frekuensi || null,
      temp: payload.vibrasi_temp || null,
      tegangan: payload.tegangan || null,
      kwatt: payload.kwatt || null,
      mixerTime: payload.mixerTime || null,
      machineTime: payload.machineTime || null,
    };

    const res = await axios.post(`${DB_SERVICE_URL}/records`, record, { timeout: 5000 });
    console.log('Saved record from', topic, 'id:', res.data.id); */
  } catch (err) {
    console.error('Failed processing message', err.message || err);
  }
});

client.on('error', (err) => {
  console.error('MQTT client error', err.message || err);
});
