const mqtt = require('mqtt');

const BROKER = process.env.MQTT_BROKER_URL || 'mqtt://mosquitto:1883';
const TOPIC_PREFIX = process.env.MQTT_TOPIC_PREFIX || 'plc';
const INTERVAL = parseInt(process.env.PUBLISH_INTERVAL || '60000', 10);
const PLC_ID = process.env.PLC_ID || 'plc1';

console.log('MQTT Dummy Publisher starting', { BROKER, TOPIC_PREFIX, INTERVAL, PLC_ID });

const client = mqtt.connect(BROKER, { reconnectPeriod: 5000, connectTimeout: 30000 });

client.on('connect', () => {
  console.log('Connected to broker', BROKER);
  setInterval(() => {
    const payload = {
      _terminalTime: new Date().toISOString(),
      _groupName: 'datamqtt',
      arus1: +(1.0 + Math.random() * 1.0).toFixed(2),
      arus2: +(1.0 + Math.random() * 1.0).toFixed(2),
      arus3: +(1.0 + Math.random() * 1.0).toFixed(2),
      tegangan: +(220 + Math.random() * 20).toFixed(2),
      kwatt: +(0.5 + Math.random() * 1.5).toFixed(2),
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
