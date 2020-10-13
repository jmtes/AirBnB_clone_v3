import jwt from 'jsonwebtoken';

import { jwtSecret } from '../../../config';

const generateToken = (userId) =>
  jwt.sign({ userId }, jwtSecret, {
    expiresIn: 2400
  });

export default generateToken;
