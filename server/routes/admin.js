// server/routes/admin.js
import express from 'express';
import jwt from 'jsonwebtoken';
import {
  adminGetStats,
  adminGetUsers,
  adminGetReports,
  adminGetUserHistory,
  adminDeleteUser,
  adminDeleteReport
} from '../controllers/symptomController.js';

const router = express.Router();

// ── Hardcoded admin credentials (single admin, no registration) ───────────────
const ADMIN_EMAIL    = 'aryan07engineer@gmail.com';
const ADMIN_PASSWORD = 'Aryan@123';

// ── Admin login ────────────────────────────────────────────────────────────────
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ message: 'Invalid admin credentials' });
  }
  const token = jwt.sign(
    { adminId: 'pranai-admin', role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
  res.json({ token, message: 'Admin login successful' });
});

// ── Admin auth middleware ──────────────────────────────────────────────────────
const adminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No admin token' });
  }
  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
    if (decoded.role !== 'admin') throw new Error('Not admin');
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired admin token' });
  }
};

// ── Protected admin routes ─────────────────────────────────────────────────────
router.get('/stats',                    adminAuth, adminGetStats);
router.get('/users',                    adminAuth, adminGetUsers);
router.get('/reports',                  adminAuth, adminGetReports);
router.get('/users/:userId/history',    adminAuth, adminGetUserHistory);
router.delete('/users/:userId',         adminAuth, adminDeleteUser);
router.delete('/reports/:reportId',     adminAuth, adminDeleteReport);

export default router;