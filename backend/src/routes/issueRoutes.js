const express = require('express');
const router = express.Router();
// ADD deleteIssue to this import
const { createIssue, getIssues, updateIssue, deleteIssue } = require('../controllers/issueController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, getIssues);
router.post('/', protect, createIssue);
router.put('/:id', protect, updateIssue);

router.delete('/:id', protect, deleteIssue);

module.exports = router;