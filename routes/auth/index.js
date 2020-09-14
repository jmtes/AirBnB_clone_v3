import express from 'express';
import { check } from 'express-validator';

import { checkAuth, validateRequest } from '../middleware';

import { getMe, loginUser } from './handlers';

const router = express.Router();

// @route   GET /api/auth
// @desc    Get logged-in user
// @access  Private
router.get('/', checkAuth, getMe);

// @route   POST /api/auth
// @desc    Authenticate user and get token
// @access  Public
router.post(
  '/',
  [
    check('email', 'Please provide a valid email.').isEmail().normalizeEmail(),
    check('password', 'Please provide a password.').isString(),
    validateRequest
  ],
  loginUser
);

export default router;
