import { Router } from 'express';
import * as tableController from '../controllers/table.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { createTableSchema, updateTableSchema } from '../validators/table.validator';
import { USER_ROLES } from '../constants';

const router = Router();

// All authenticated users can view tables
router.get('/', authenticate, tableController.getAllTables);

// Only admins can create, update, delete
router.post(
  '/',
  authenticate,
  authorize(USER_ROLES.ADMIN),
  validate(createTableSchema),
  tableController.createTable,
);

router.patch(
  '/:id',
  authenticate,
  authorize(USER_ROLES.ADMIN),
  validate(updateTableSchema),
  tableController.updateTable,
);

router.delete(
  '/:id',
  authenticate,
  authorize(USER_ROLES.ADMIN),
  tableController.deleteTable,
);

export default router;
