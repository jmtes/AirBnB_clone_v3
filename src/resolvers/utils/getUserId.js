import jwt from 'jsonwebtoken';

import { jwtSecret } from '../../../config';

const getUserId = (req, authRequired = true) => {
  const header = req.request
    ? req.request.headers.authorization
    : req.connection.context.Authorization;

  if (header) {
    const token = header.replace('Bearer ', '');
    const decoded = jwt.verify(token, jwtSecret);

    return decoded.userId;
  }

  if (authRequired) throw Error('Authentication required.');

  return null;
};

export default getUserId;
