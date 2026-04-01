// backend/src/routes/authRoutes.js
import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  verifyResetToken,
  resetPassword,
  refreshToken,
  requestResetCode,
  verifyResetCode,
  resetPasswordWithCode
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// ============== مسارات المصادقة الأساسية ==============
router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/refresh-token', refreshToken);

// ============== مسارات إعادة تعيين كلمة المرور (بالرمز) ==============
router.post('/request-reset-code', requestResetCode);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password-with-code', resetPasswordWithCode);

// ============== مسارات إعادة تعيين كلمة المرور (بالرابط) ==============
router.post('/forgot-password', forgotPassword);
router.get('/verify-reset-token/:token', verifyResetToken);
router.post('/reset-password', resetPassword);

export default router;