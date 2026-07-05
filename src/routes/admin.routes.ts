import { Router } from 'express';
import * as adminController from '../controllers/admin.reservation.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { updateReservationSchema } from '../validators/reservation.validator';
import { USER_ROLES } from '../constants';

const router = Router();

// All admin routes require authentication + ADMIN role
router.use(authenticate);
router.use(authorize(USER_ROLES.ADMIN));

router.get('/dashboard', adminController.getDashboardAnalytics);
router.get('/', adminController.getAllReservations);
router.get('/:id', adminController.getAdminReservationById);
router.patch('/:id', validate(updateReservationSchema), adminController.updateReservation);
router.delete('/:id', adminController.cancelAnyReservation);

export default router;
