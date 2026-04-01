// backend/src/routes/blockRoutes.js
import express from 'express';
import { protect } from '../middleware/auth.js';
import { blockUser, unblockUser, getBlockedUsers } from '../controllers/blockController.js';

const router = express.Router();

router.use(protect);

router.post('/block/:userId', blockUser);
router.delete('/block/:userId', unblockUser);
router.get('/blocks', getBlockedUsers);

export default router;