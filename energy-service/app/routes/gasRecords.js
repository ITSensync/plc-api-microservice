const express = require('express');
const { createGasRecord } = require('../controllers/GasRecordController');

const router = express.Router();

router.post('/', createGasRecord);
// router.get('/paginated', getPaginatedRecords);
// router.get('/', getRecords);

module.exports = router;
