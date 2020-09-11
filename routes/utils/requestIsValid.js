const { validationResult } = require('express-validator');

module.exports = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return false;
  }

  return true;
};
