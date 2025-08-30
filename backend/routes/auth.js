
const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { auth } = require('../middlewares/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/users', auth, async (req, res) => {
  try {
    // Only allow admin
    const user = req.user || (req.userId && await require('../models/User').findById(req.userId));
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const users = await require('../models/User').find({}, '-password').sort({ createdAt: -1 });
    res.json({ success: true, data: { users, total: users.length } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// Validation middleware
const registerValidation = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please enter a valid phone number'),
  body('role')
    .optional()
    .isIn(['patient', 'caregiver', 'admin'])
    .withMessage('Invalid role selected')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// Routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);

// Admin login route
router.post('/admin-login', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email address'),
  body('password').notEmpty().withMessage('Password is required')
], authController.adminLogin);
router.get('/me', auth, authController.getMe);
router.put('/profile', auth, authController.updateProfile);
router.put('/change-password', auth, changePasswordValidation, authController.changePassword);

module.exports = router;
