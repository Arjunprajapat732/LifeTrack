const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const { provideHealthAssistance } = require('../controllers/aiController');

/**
 * @route   POST /api/ai/health-assistance
 * @desc    Provide AI health assistance for patients and caregivers
 * @access  Private
 */
router.post('/health-assistance', auth, async (req, res) => {
  try {
    const { question, userContext } = req.body;
    const userRole = req.user.role || 'patient';

    if (!question || question.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Question is required'
      });
    }

    // Provide health assistance
    const result = await provideHealthAssistance(question, userRole, userContext || {});
    
    res.json({
      success: true,
      data: result,
      message: 'Health assistance provided successfully'
    });

  } catch (error) {
    console.error('Error in health-assistance route:', error);
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to provide health assistance'
    });
  }
});

module.exports = router;
