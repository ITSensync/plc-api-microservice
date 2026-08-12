const { Op } = require('sequelize');
const { EnergyRecord, Machine, ActivityLog } = require('../models');

const parsePagination = (req) => {
  const limit = Math.min(parseInt(req.query.limit || '100', 10), 1000);
  const offset = parseInt(req.query.skip || '0', 10);
  return { limit, offset };
};

const parsePagePagination = (req) => {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.min(parseInt(req.query.limit || '10', 10), 1000);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

const parseDateFilter = (req) => {
  const { startDate, endDate } = req.query;

  if (!startDate && !endDate) {
    return {};
  }

  const normalizeDatePart = (value) => {
    if (!value) {
      return null;
    }

    const trimmed = String(value).trim();
    const datePart = trimmed.split('T')[0];
    return datePart || null;
  };

  const startDay = normalizeDatePart(startDate);
  const endDay = normalizeDatePart(endDate || startDate);

  if (!startDay || !endDay) {
    return {};
  }

  const start = `${startDay} 00:00:00`;
  const end = `${endDay} 23:59:59`;

  return {
    _terminalTime: {
      [Op.like]: `%${startDay}%`,
      [Op.like]: `%${endDay}%`,
    },
  };
};

const getTodayRange = () => {
  const end = new Date();
  const start = new Date(end);
  start.setMinutes(start.getMinutes() - 2);

  return { start, end };
};

exports.createEnergyRecord = async (payload) => {
  try {
    const { _groupName, _terminalTime, arus1, arus2, arus3, temp, getaran, tegangan, kwatt, mixerTime, machineTime } = payload;

    const machine = await Machine.findOne({ where: { groupName: _groupName } });
    if (!machine) {
      throw { status: 404, message: 'Machine not found for machineId' };
    }

    const data = await EnergyRecord.create({
      machineId: _groupName,
      _terminalTime,
      arus1,
      arus2,
      arus3,
      getaran,
      temp,
      tegangan: 0,
      kwatt,
      mixerTime,
      machineTime
    });

    /* BROADCAST CALL */
    const { broadcastEnergyRecord } = require('./broardcastService');
    await broadcastEnergyRecord(_groupName);

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

exports.fetchTodayRecords = async (payload) => {
  try {
    const { machineId } = payload;

    if (!machineId) {
      return {
        status: 400,
        message: 'Machine id cannot be null!',
      };
    }

    const { start, end } = getTodayRange();

    const records = await EnergyRecord.findAll({
      where: {
        machineId,
        createdAt: { [Op.between]: [start, end] },
      },
      order: [['createdAt', 'ASC']],
      raw: true,
    });

    return {
      status: 200,
      message: "Success fetch today record",
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

exports.fetchPaginatedEnergyRecords = async (req) => {
  try {
    const { page, limit, offset } = parsePagePagination(req);
    const dateFilter = parseDateFilter(req);

    const totalItems = await EnergyRecord.count({
      where: dateFilter,
    });
    const records = await EnergyRecord.findAll({
      where: dateFilter,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      raw: true,
    });

    return {
      status: 200,
      message: 'Success fetch paginated energy record',
      data: records,
      currentPage: page,
      totalPages: Math.max(Math.ceil(totalItems / limit), 1),
      totalItems,
      limit,
    };
  } catch (error) {
    console.error(error);
    return {
      status: 500,
      message: error.message,
      error: error,
    }
  }
};
