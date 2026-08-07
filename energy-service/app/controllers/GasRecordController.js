const gasRecordService = require('../services/gasRecordService');

exports.createGasRecord = async (req, res) => {
  const result = await gasRecordService.create(req.body);
  res.status(result.status).json(result);
}