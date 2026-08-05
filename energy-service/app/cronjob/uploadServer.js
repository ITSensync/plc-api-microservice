const axios = require('axios');
const { Op } = require('sequelize');
const { EnergyRecord } = require('../models');

exports.uploadToServer = async () => {
  try {
    const now = new Date();
    const twoMinutesAgo = new Date(now);
    twoMinutesAgo.setMinutes(now.getMinutes() - 2);

    const records = await EnergyRecord.findAll({
      where: {
        createdAt: {
          [Op.between]: [twoMinutesAgo, now],
        },
      },
      order: [['createdAt', 'DESC']],
      raw: true,
    });

    if (!records.length) {
      return { status: 200, message: 'No records to upload' };
    }

    const targetUrl = process.env.UPLOAD_SERVER_URL || 'http://host.docker.internal:3001/records';

    const response = await axios.post(targetUrl, records, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    return {
      status: 200,
      message: 'Records uploaded successfully',
      uploadedCount: records.length,
      responseData: response.data,
    };
  } catch (error) {
    console.error('Failed to upload records:', error);
    return {
      status: 500,
      message: error.message,
    };
  }
};