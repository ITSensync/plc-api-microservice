const { StatusMachine } = require("../models");

exports.updateStatus = async (req, res) => {
  try {
    const { machineId } = req.body();

    if (!machineId) {
      return res.status(400).json({ error: "machine ID cannot be null" })
    }

    const machineStatus = await StatusMachine.update({
      
    })
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to update machine status' });
  }
}