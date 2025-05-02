import express from 'express';
import { calculateCalorieTarget } from '../controllers/calorieController.js';
import  auth  from '../middleware/auth.js';
import { generateHealthReport } from '../controllers/generateReport.js';
const router = express.Router();

router.post('/calculate', auth, calculateCalorieTarget);
router.post('/report',auth,generateHealthReport);

export default router; 