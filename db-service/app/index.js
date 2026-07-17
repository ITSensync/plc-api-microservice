const express = require('express');
const bodyParser = require('body-parser');
const { sequelize, PlcRecord } = require('./models');

const app = express();
app.use(bodyParser.json());

app.post('/records', async (req, res) => {
  try {
    const record = await PlcRecord.create(req.body);
    return res.status(201).json(record);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to save record' });
  }
});

app.get('/records', async (req, res) => {
  try {
    const records = await PlcRecord.findAll({
      limit: Math.min(parseInt(req.query.limit || '100', 10), 1000),
      offset: parseInt(req.query.skip || '0', 10),
      order: [['createdAt', 'DESC']],
    });
    return res.json(records);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch records' });
  }
});

app.get('/', (req, res) => {
  res.json({ status: 'running' });
});

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    app.listen(8001, '0.0.0.0', () => {
      console.log('DB service is running on port 8001');
    });
  } catch (error) {
    console.error('Unable to connect to DB:', error);
    process.exit(1);
  }
};

start();
