const { EnergyRecord, Machine, ActivityLog } = require('../models');

const parsePagination = (req) => {
  const limit = Math.min(parseInt(req.query.limit || '100', 10), 1000);
  const offset = parseInt(req.query.skip || '0', 10);
  return { limit, offset };
};


exports.createEnergyRecord = async (payload) => {
  try {
    const { _groupName, _terminalTime, arus1, arus2, arus3, getaran, tegangan, kwatt } = payload;

    const machine = await Machine.findOne({ where: { groupName: _groupName } });
    if (!machine) {
      throw { status: 404, message: 'Machine not found for machineId' };
    }

    const data = EnergyRecord.create({
      machineId: _groupName,
      _terminalTime,
      arus1,
      arus2,
      arus3,
      getaran,
      temp,
      tegangan,
      kwatt,
    });

    return {
      status: 200,
      message: "Success Create Record",
      data,
    }
  } catch (error) {
    console.error(error);
    return {
      status: 500,
      message: error.message,
      error: error,
    }
  }

};

exports.fetchEnergyRecords = async (options) => {
  try {
    const { limit } = options;
    // const include = [];

    /* if (options.query.includeActivityLogs === 'true') {
      include.push({ model: ActivityLog, as: 'activityLogs' });
    }

    if (options.query.includeMachine === 'true') {
      include.push({ model: Machine, as: 'machine' });
    } */

    const records = await EnergyRecord.findAll({
      limit,
      // offset,
      order: [['createdAt', 'DESC']],
      // include,
    });

    return {
      status: 200,
      message: "Success fetch record",
      data: records,
    }
  } catch (error) {
    console.error(error);
    return {
      status: 500,
      message: error.message,
      error: error,
    }
  }
};
