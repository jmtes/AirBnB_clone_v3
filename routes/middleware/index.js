import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';

import keys from '../../config/keys';

export const checkAuth = (req, res, next) => {
  // Get token from header
  const token = req.header('Auth-Token');

  // Check if not token
  if (!token) {
    res.status(401).json({ message: 'Authorization denied.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, keys.jwtSecret);

    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  next();
};
