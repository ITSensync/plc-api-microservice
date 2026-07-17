import os

DB_SERVICE_URL = os.getenv("DB_SERVICE_URL", "http://localhost:8001")
POLL_INTERVAL = int(os.getenv("POLL_INTERVAL", "5"))

PLC_DEVICES = [
    {
        "id": "plc1",
        "host": "192.168.0.10",
        "port": 502,
        "unit_id": 1,
        "registers": {"start": 0, "count": 10},
    },
    {
        "id": "plc2",
        "host": "192.168.0.11",
        "port": 502,
        "unit_id": 1,
        "registers": {"start": 0, "count": 10},
    },
    {
        "id": "plc3",
        "host": "host.docker.internal",
        "port": 1502,
        "unit_id": 1,
        "registers": {"start": 0, "count": 10}
    },
]
