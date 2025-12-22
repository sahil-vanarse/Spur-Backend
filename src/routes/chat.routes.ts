import { Router } from 'express';
import { handleChatMessage, getChatHistory, clearConversation } from '../controllers/chat.controller';

const router = Router();

router.post('/message', handleChatMessage);
router.get('/history/:sessionId', getChatHistory);
router.post('/clear', clearConversation);

export default router;
