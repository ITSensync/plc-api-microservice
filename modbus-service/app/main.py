import asyncio
from fastapi import FastAPI
import httpx
from pymodbus.client import AsyncModbusTcpClient
from pymodbus.payload import BinaryPayloadDecoder
from pymodbus.constants import Endian
from .config import PLC_DEVICES, DB_SERVICE_URL, POLL_INTERVAL

app = FastAPI(title="Modbus Service")

async def read_plc_data(client: AsyncModbusTcpClient, unit_id: int, start: int, count: int):
    rr = await client.read_holding_registers(address=start, count=count, unit=unit_id)
    if rr.isError():
        raise RuntimeError(f"Read error: {rr}")
    decoder = BinaryPayloadDecoder.fromRegisters(rr.registers, byteorder=Endian.Big)
    values = []
    for _ in range(count // 2):
        try:
            values.append(decoder.decode_32bit_float())
        except Exception:
            values.append(decoder.decode_16bit_uint())
    return values if values else rr.registers

async def post_record(payload: dict):
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(f"{DB_SERVICE_URL}/records", json=payload)
        response.raise_for_status()
        return response.json()

async def poll_plc(plc_config: dict):
    host = plc_config["host"]
    port = plc_config["port"]
    unit_id = plc_config["unit_id"]
    registers = plc_config["registers"]
    async with AsyncModbusTcpClient(host=host, port=port) as client:
        if not client.connected:
            raise ConnectionError(f"Tidak bisa konek ke PLC {host}:{port}")
        while True:
            try:
                values = await read_plc_data(client, unit_id, registers["start"], registers["count"])
                payload = {
                    "plc_id": plc_config["id"],
                    "host": host,
                    "port": port,
                    "unit_id": unit_id,
                    "values": {f"register_{i}": v for i, v in enumerate(values, start=registers["start"])},
                }
                await post_record(payload)
            except Exception as exc:
                print(f"[ERROR] {plc_config['id']} - {exc}")
            await asyncio.sleep(POLL_INTERVAL)

async def start_polling():
    await asyncio.gather(*(poll_plc(plc) for plc in PLC_DEVICES))

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(start_polling())

@app.get("/")
def health_check():
    return {"status": "running", "plcs": [plc["id"] for plc in PLC_DEVICES]}
