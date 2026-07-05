import { Router } from 'express';
import * as reservationController from '../controllers/reservation.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { createReservationSchema } from '../validators/reservation.validator';
import { USER_ROLES } from '../constants';

const router = Router();

// All customer reservation routes require authentication
router.use(authenticate);
router.use(authorize(USER_ROLES.CUSTOMER));

router.get('/available', reservationController.checkAvailability);
router.post('/', validate(createReservationSchema), reservationController.createReservation);
router.get('/', reservationController.getMyReservations);
router.get('/:id', reservationController.getReservationById);
router.patch('/:id/cancel', reservationController.cancelReservation);

export default router;
