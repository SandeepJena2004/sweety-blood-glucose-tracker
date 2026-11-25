import { Router } from 'express';
import * as readingController from '../controllers/readingController.js';
import { authenticate } from '../middleware/auth.js';
import { readingSchema, readingUpdateSchema, validate } from '../validators/readingValidator.js';

const router = Router();

router.use(authenticate);

router.post('/', validate(readingSchema), readingController.create);
router.get('/', readingController.getAll);
router.get('/:id', readingController.getOne);
router.put('/:id', validate(readingUpdateSchema), readingController.update);
router.delete('/:id', readingController.remove);

export default router;
