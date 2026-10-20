import express from 'express';
import { storage } from '../services/storageService.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/v1/notifications — List notifications for authenticated user
router.get('/', requireAuth, (req, res) => {
  const notifs = storage.getNotificationsForUser(req.user.id);
  const unreadCount = notifs.filter((n) => !n.isRead).length;

  res.json({
    success: true,
    unreadCount,
    notifications: notifs
  });
});

// PATCH /api/v1/notifications/:id/read — Mark single notification as read
router.patch('/:id/read', requireAuth, (req, res) => {
  const notif = storage.markNotificationRead(req.params.id, req.user.id);
  if (!notif) {
    return res.status(404).json({ error: 'Notification not found.' });
  }
  res.json({ success: true, notification: notif });
});

// PATCH /api/v1/notifications/read-all — Mark all notifications as read
router.patch('/read-all', requireAuth, (req, res) => {
  const notifs = storage.getNotificationsForUser(req.user.id);
  for (const n of notifs) {
    n.isRead = true;
  }
  storage.saveDatabase();
  res.json({ success: true, message: 'All notifications marked as read.' });
});

export default router;
