const express = require('express');
const { body } = require('express-validator');
const contactController = require('../controllers/contactController');
const auth = require('../middlewares/auth');

const router = express.Router();

// Validation middleware
const contactValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please enter a valid phone number'),
  body('subject')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Subject must be between 5 and 200 characters'),
  body('message')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters'),
  body('category')
    .optional()
    .isIn(['general', 'support', 'sales', 'feedback', 'complaint'])
    .withMessage('Invalid category selected')
];

const updateContactValidation = [
  body('status')
    .optional()
    .isIn(['pending', 'read', 'replied', 'closed'])
    .withMessage('Invalid status selected'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority selected'),
  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID'),
  body('notes.content')
    .optional()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Note content must be between 1 and 500 characters')
];

// Public routes
router.post('/', contactValidation, contactController.submitContact);

// Protected routes (admin only)
router.get('/', auth, contactController.getAllContacts);
router.get('/stats', auth, contactController.getContactStats);
router.get('/:id', auth, contactController.getContact);
router.put('/:id', auth, updateContactValidation, contactController.updateContact);
router.delete('/:id', auth, contactController.deleteContact);

module.exports = router;
