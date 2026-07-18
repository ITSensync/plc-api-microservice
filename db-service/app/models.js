const { Sequelize, DataTypes } = require('sequelize');

const databaseUrl = process.env.DATABASE_URL || 'mysql://root:makanminggu12@mysql:3306/plc-test';
const sequelize = new Sequelize(databaseUrl, {
  dialect: 'mysql',
  logging: false,
});

const PlcRecord = sequelize.define('PlcRecord', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  _terminalTime: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  _groupName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  arus1: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  arus2: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  arus3: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  tegangan: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  kwatt: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
}, {
  tableName: 'plc_records',
  timestamps: true,
});

module.exports = {
  sequelize,
  PlcRecord,
};
