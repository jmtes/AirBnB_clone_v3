import express from 'express';
import { param } from 'express-validator';

import { validateRequest } from '../middleware';

import { getCity, getCities } from './handlers';

const router = express.Router();

// @route   GET api/cities/:id
// @desc    Get one city
// @access  Public
router.get(
  '/:id',
  [param('id', 'Please provide a valid city ID.').isMongoId(), validateRequest],
  getCity
);

// @route   GET api/cities
// @desc    Get all cities
// @access  Public
router.get('/', getCities);

export default router;
