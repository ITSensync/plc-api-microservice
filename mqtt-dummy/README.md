# MQTT Dummy Publisher

Publishes JSON payloads periodically to MQTT broker to simulate PLC data.

Environment variables:
- `MQTT_BROKER_URL` (default: `mqtt://mosquitto:1883`)
- `MQTT_TOPIC_PREFIX` (default: `plc`)
- `PLC_ID` (default: `plc1`)
- `PUBLISH_INTERVAL` ms (default: 5000)

Run locally:

```bash
cd mqtt-dummy
npm install
MQTT_BROKER_URL=mqtt://localhost:1883 PLC_ID=plc1 npm start
```

Run with Docker (same compose network):

```bash
docker build -t mqtt-dummy:local ./mqtt-dummy
docker run --rm --network modbus-plc_default -e MQTT_BROKER_URL=mqtt://mosquitto:1883 -e PLC_ID=plc1 mqtt-dummy:local
```

Or add to `docker-compose.yml` as a service named `mqtt-dummy` (optional).