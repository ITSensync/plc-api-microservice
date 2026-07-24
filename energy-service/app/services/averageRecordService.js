const { AverageRecord, EnergyRecord } = require("../models")
const { Op, fn, col } = require('sequelize');

exports.fetchLatestAverage = async (machineId) => {
  try {
    const latestAverage = await AverageRecord.findOne({
      where: { machineId },
      order: [['createdAt', 'DESC']],
      raw: true,
    });

    return {
      status: 200,
      message: 'Success fetch latest average record',
      data: latestAverage,
    };
  } catch (error) {
    return {
      status: 500,
      message: error.message,
      error,
    };
  }
};

exports.createAverage = async (payload) => {
  try {
    const { machineId } = payload;

    if (!machineId) {
      return {
        status: 400,
        message: "Machine id cannot be null!",
      }
    }

    const fiveMinutesAgo = new Date();
    // twoMinutesAgo.setSeconds(0, 0);
    fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
    fiveMinutesAgo.setHours(fiveMinutesAgo.getHours() + 7);

    const now = new Date();
    // now.setSeconds(0, 0);
    now.setHours(now.getHours() + 7);

    const avgRecord = await EnergyRecord.findOne({
      attributes: [
        [fn('ROUND', fn('AVG', col('arus1')), 2), 'arus1'],
        [fn('ROUND', fn('AVG', col('arus2')), 2), 'arus2'],
        [fn('ROUND', fn('AVG', col('arus3')), 2), 'arus3'],
        [fn('ROUND', fn('AVG', col('getaran')), 2), 'getaran'],
        [fn('ROUND', fn('AVG', col('tegangan')), 2), 'tegangan'],
        [fn('ROUND', fn('AVG', col('temp')), 2), 'temp'],
        [fn('ROUND', fn('AVG', col('kwatt')), 2), 'kwatt'],
      ],
      where: {
        machineId,
        createdAt: { [Op.gte]: fiveMinutesAgo }
      },
      raw: true,
    });

    const resultAvg = await AverageRecord.create({
      machineId,
      ...avgRecord
    })

    return {
      status: 200,
      message: "Success create average record",
      data: avgRecord,
    }
  } catch (error) {
    return {
      status: 500,
      message: error.message,
      error,
    }
  }
}