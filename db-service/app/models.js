const { Sequelize, DataTypes } = require('sequelize');

const databaseUrl = process.env.DATABASE_URL || 'mysql://root:makanminggu12@mysql:3306/modbus-test';
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
  plc_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  host: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  port: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  unit_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  values: {
    type: DataTypes.JSON,
    allowNull: false,
  },
}, {
  tableName: 'plc_records',
  timestamps: true,
});

module.exports = {
  sequelize,
  PlcRecord,
};
