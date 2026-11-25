import { Router } from 'express';
import * as reportController from '../controllers/reportController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/daily', reportController.dailyReport);
router.get('/month-to-date', reportController.monthToDateReport);
router.get('/monthly', reportController.monthlyReport);

export default router;
