const axios = require('axios');

const DB_SERVICE_URL = process.env.DB_SERVICE_URL || 'http://energy-service:8001';

exports.sendGasFlow = async (payload) => {
  const flow = payload.flow != null ? Number(payload.flow) : null;
  const total_flow = payload.totalflow != null ? Number(payload.totalflow) : null;

  if (flow === null && total_flow === null) {
    throw new Error('Missing flow or totalflow in payload');
  }

  const body = {
    flow,
    total_flow,
  };

  const response = await axios.post(`${DB_SERVICE_URL}/gas`, body, {
    timeout: 5000,
  });

  return response.data;
};
