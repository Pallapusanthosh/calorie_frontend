import express from 'express';
import { updateProfile, getProfile } from '../controllers/profilecontroller.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, updateProfile);
router.get('/:userId', auth, getProfile);

export default router;
