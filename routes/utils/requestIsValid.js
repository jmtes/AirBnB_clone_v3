const { validationResult } = require('express-validator');

module.exports = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const message = errors.array()[0].msg;
    res.status(400).json({ message });
    return false;
  }

  return true;
};
