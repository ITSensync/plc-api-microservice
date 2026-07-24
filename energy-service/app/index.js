const express = require('express');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const { sequelize, initializeDummyData, EnergyRecord } = require('./models');
const recordsRouter = require('./routes/records');
const activityLogsRouter = require('./routes/activityLogs');
// const machineStatusRouter = require('./routes/machineStatus');
const job = require('./cronjob/main')

const app = express();
app.use(bodyParser.json());

app.use('/records', recordsRouter);
app.use('/activity-logs', activityLogsRouter);
// app.use('/machine-status', machineStatusRouter);

app.get('/', (req, res) => {
  res.json({ status: 'running' });
});

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    // await EnergyRecord.sync({ alter: true })
    await initializeDummyData();
    app.listen(8001, '0.0.0.0', () => {
      console.log('DB service is running on port 8001');
    });
  } catch (error) {
    console.error('Unable to connect to DB:', error);
    process.exit(1);
  }
};

start();

cron.schedule('*/5 * * * * *', async () => {
  await job.checkRecords();
});