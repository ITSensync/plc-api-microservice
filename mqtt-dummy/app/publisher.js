const mqtt = require('mqtt');

const BROKER = process.env.MQTT_BROKER_URL || 'mqtt://mosquitto:1883';
const TOPIC_PREFIX = process.env.MQTT_TOPIC_PREFIX || 'plc';
const INTERVAL = parseInt(process.env.PUBLISH_INTERVAL || '5000', 10);
const PLC_ID = process.env.PLC_ID || 'plc1';

console.log('MQTT Dummy Publisher starting', { BROKER, TOPIC_PREFIX, INTERVAL, PLC_ID });

const client = mqtt.connect(BROKER, { reconnectPeriod: 5000, connectTimeout: 30000 });

client.on('connect', () => {
  console.log('Connected to broker', BROKER);
  setInterval(() => {
    const payload = {
      timestamp: new Date().toISOString(),
      values: {
        temp: +(20 + Math.random() * 10).toFixed(2),
        pressure: +(100 + Math.random() * 20).toFixed(2),
      },
    };
    const topic = `${TOPIC_PREFIX}/${PLC_ID}`;
    client.publish(topic, JSON.stringify(payload), { qos: 0 }, (err) => {
      if (err) console.error('Publish error', err);
      else console.log('Published to', topic, JSON.stringify(payload));
    });
  }, INTERVAL);
});

client.on('reconnect', () => console.log('Reconnecting to broker...'));
client.on('error', (err) => console.error('MQTT client error', err && err.message ? err.message : err));
client.on('close', () => console.log('MQTT connection closed'));
