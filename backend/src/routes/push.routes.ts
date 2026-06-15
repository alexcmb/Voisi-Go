import { Router } from 'express';
import { vapidPublicKey, subscribe, unsubscribe, sendTest } from '../controllers/push.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/vapid-public-key', vapidPublicKey);
router.post('/subscribe', authenticateToken, subscribe);
router.post('/unsubscribe', authenticateToken, unsubscribe);
router.post('/test', authenticateToken, sendTest);

export default router;
