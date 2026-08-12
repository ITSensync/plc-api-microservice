const axios = require('axios');

const DB_SERVICE_URL = process.env.DB_SERVICE_URL || 'http://energy-service:8001';

exports.sendRecord = async (payload) => {
  const record = {
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

  const response = await axios.post(`${DB_SERVICE_URL}/records`, record, {
    timeout: 5000,
  });

  return response.data;
};
