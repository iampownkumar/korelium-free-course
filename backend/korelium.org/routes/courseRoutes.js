const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const authenticateToken = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Public: Get all courses (remove `authenticateToken` if you want this open)
router.get('/', authenticateToken, courseController.getAllCourses);

// Admin-only: Create, Update, Delete course
router.post('/', authenticateToken, upload.single('image'), courseController.createCourse);
router.put('/:id', authenticateToken, upload.single('image'), courseController.updateCourse);
router.delete('/:id', authenticateToken, courseController.deleteCourse);

module.exports = router;
