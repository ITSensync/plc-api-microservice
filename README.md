# PLC API Microservices

Arsitektur mikroservis untuk membaca data PLC (Modbus TCP & MQTT) dan menyimpannya ke database. Sistem ini mengumpulkan data listrik (arus, tegangan, daya) dari berbagai sumber dan menyimpannya secara terpusat.

## Komponen

### Backend Services

- **`db-service`** (Node.js): REST API untuk menyimpan dan mengambil data PLC. Menggunakan Sequelize ORM dengan MySQL.
  - PORT: 8001
  - Endpoints: `POST /records`, `GET /records`

- **`modbus-service`** (Python): Polling PLC Modbus TCP dan mengirim data ke database service.
  - PORT: 8000
  - Konfigurasi PLC di `modbus-service/app/config.py`

- **`mqtt-service`** (Node.js): Subscriber MQTT yang menerima data dari broker dan menyimpannya ke database.
  - Mendengarkan topic: `plc/#`
  - Memetakan payload MQTT ke model database

### Data Sources

- **`mqtt-dummy`** (Node.js): Publisher MQTT yang menghasilkan data dummy untuk testing.
  - Mempublikasikan setiap 60 detik (configurable via `PUBLISH_INTERVAL`)
  - Topic: `plc/plc1`

### Infrastructure

- **`mosquitto`**: MQTT Message Broker
  - PORT: 1883
  - Konfigurasi di `mosquitto/config/mosquitto.conf`

## Data Model

Setiap record PLC menyimpan:

```json
{
  "_terminalTime": "2026-07-06T17:41:01.808Z",
  "_groupName": "datamqtt",
  "arus1": 1.29,
  "arus2": 1.27,
  "arus3": 1.27,
  "tegangan": 231.00,
  "kwatt": 0.70
}
```

**Field:**
- `_terminalTime`: Timestamp pengiriman data (ISO 8601)
- `_groupName`: Nama grup data (contoh: 'datamqtt')
- `arus1`, `arus2`, `arus3`: Arus 3 fase (Ampere)
- `tegangan`: Tegangan listrik (Volt)
- `kwatt`: Daya aktif (Kilowatt)

## Setup & Konfigurasi

### 1. Persiapan Environment

Salin `.env.example` ke `.env` dan sesuaikan credential Anda:

```bash
cp .env.example .env
```

Edit `.env` dengan credential Anda:

```bash
# Database Configuration
MYSQL_ROOT_PASSWORD=your_root_password
MYSQL_DATABASE=plc-test
MYSQL_USER=sensync_user
MYSQL_PASSWORD=your_password

# MQTT Configuration
MQTT_BROKER_URL=mqtt://mosquitto:1883
MQTT_TOPIC=plc/#
MQTT_TOPIC_PREFIX=plc
PLC_ID=plc1
PUBLISH_INTERVAL=60000

# Services Configuration
DB_SERVICE_URL=http://db-service:8001
DATABASE_URL=mysql://root:your_root_password@mysql:3306/plc-test
```

**⚠️ Penting:** File `.env` disimpan di `.gitignore` dan TIDAK akan di-commit ke repository untuk menjaga keamanan credential.

### 2. Menjalankan dengan Docker

1. Pastikan `.env` sudah dikonfigurasi dengan benar
2. Jalankan: `docker compose up --build`
3. Semua services akan otomatis memuat configuration dari `.env`

### Services URLs

- `db-service`: http://localhost:8001
- `phpmyadmin`: http://localhost:8000 (username: root)
- `modbus-service`: http://localhost:8000 (jika diaktifkan)
- MQTT Broker: mqtt://localhost:1883

## API Database Service

- `POST /records` - Simpan data PLC
  ```json
  {
    "_terminalTime": "2026-07-06T17:41:01.808Z",
    "_groupName": "datamqtt",
    "arus1": 1.29,
    "arus2": 1.27,
    "arus3": 1.27,
    "tegangan": 231.00,
    "kwatt": 0.70
  }
  ```

- `GET /records` - Ambil semua data tersimpan

## Kebutuhan

- Docker & Docker Compose
- Node.js 14+ (jika menjalankan tanpa Docker)
- Python 3.11+ (untuk modbus-service)
- MySQL 8.0+ (jika menggunakan database eksternal)
