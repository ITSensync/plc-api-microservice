# Modbus TCP Microservices

Arsitektur mikroservis untuk membaca data Modbus TCP dari lebih dari satu PLC dan menyimpannya ke database.

## Komponen

- `modbus-service`: polling PLC Modbus TCP dan meneruskan data ke database service.
- `db-service`: menyimpan record PLC ke database MySQL melalui API REST.

## Menjalankan dengan Docker

1. Jalankan `docker compose up --build`.
2. `modbus-service` akan tersedia di `http://localhost:8000`.
3. `db-service` akan tersedia di `http://localhost:8001`.

## Konfigurasi PLC

Tambahkan atau ubah konfigurasi PLC di `modbus-service/app/config.py`.

## API Database Service

- `POST /records` - simpan data PLC.
- `GET /records` - ambil data tersimpan.

## Kebutuhan

- Python 3.11+
- Docker & Docker Compose
