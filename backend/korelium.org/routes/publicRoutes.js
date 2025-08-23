const { Course, sequelize } = require('../models');
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');

// Helper function to generate slug from category name
const generateSlug = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// Helper function to parse JSON safely
const safeJsonParse = (jsonString) => {
  if (!jsonString) return [];
  if (Array.isArray(jsonString)) return jsonString;
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('Failed to parse JSON:', jsonString);
    return [];
  }
};

// API 1: Get single course by slug
router.get('/course/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const course = await Course.findOne({
      where: { slug: slug }
    });

    if (!course) {
      return res.status(404).json({ 
        success: false,
        message: 'Course not found',
        error: 'COURSE_NOT_FOUND'
      });
    }

    // Parse JSON fields and add computed fields
    const parsedCourse = {
      ...course.toJSON(),
      tags: safeJsonParse(course.tags),
      whatYoullLearn: safeJsonParse(course.whatYoullLearn),
      categorySlug: generateSlug(course.category),
      // Add default values for missing fields
      students: course.students || Math.floor(Math.random() * 10000) + 1000,
      rating: course.rating || (4.0 + Math.random() * 1.0).toFixed(1),
      originalPrice: course.originalPrice || (Math.floor(Math.random() * 100) + 29.99).toFixed(2),
    };

    res.json({
      success: true,
      data: parsedCourse
    });
  } catch (err) {
    console.error('Error fetching course by slug:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: err.message 
    });
  }
});

// API 2: Get courses filtered by category slug
router.get('/courses/category/:categorySlug', async (req, res) => {
  try {
    const { categorySlug } = req.params;
    const { page = 1, limit = 12, search } = req.query;

    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    let whereCondition = {};
    let categoryInfo = null;

    // If categorySlug is not 'all', filter by category
    if (categorySlug && categorySlug.toLowerCase() !== 'all') {
      // Get all categories to find matching category name
      const categories = await Course.findAll({
        attributes: [
          [sequelize.fn('DISTINCT', sequelize.col('category')), 'category']
        ],
        where: {
          category: { [Op.ne]: null }
        },
        raw: true,
      });

      // Find category by slug
      const matchingCategory = categories.find(cat => 
        generateSlug(cat.category) === categorySlug
      );

      if (matchingCategory) {
        whereCondition.category = matchingCategory.category;
        categoryInfo = {
          slug: categorySlug,
          name: matchingCategory.category,
          found: true
        };
      } else {
        // Return empty result if category not found
        return res.json({
          success: true,
          data: {
            courses: [],
            pagination: {
              currentPage: parseInt(page),
              totalPages: 0,
              totalCourses: 0,
              hasNextPage: false,
              hasPrevPage: false,
              limit: parseInt(limit)
            },
            category: {
              slug: categorySlug,
              name: null,
              found: false
            }
          }
        });
      }
    } else {
      categoryInfo = {
        slug: 'all',
        name: 'All Categories',
        found: true
      };
    }

    // Add search functionality
    if (search) {
      const searchCondition = {
        [Op.or]: [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
          { fullDescription: { [Op.iLike]: `%${search}%` } },
          { instructor: { [Op.iLike]: `%${search}%` } },
          { tags: { [Op.iLike]: `%${search}%` } },
        ]
      };

      whereCondition = Object.keys(whereCondition).length > 0 
        ? { [Op.and]: [whereCondition, searchCondition] }
        : searchCondition;
    }

    // Get total count for pagination
    const totalCourses = await Course.count({
      where: whereCondition
    });

    // Get courses with pagination
    const courses = await Course.findAll({
      where: whereCondition,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Parse JSON fields and enhance data
    const parsedCourses = courses.map(course => ({
      ...course.toJSON(),
      tags: safeJsonParse(course.tags),
      whatYoullLearn: safeJsonParse(course.whatYoullLearn),
      categorySlug: generateSlug(course.category),
      // Add default values for missing fields
      students: course.students || Math.floor(Math.random() * 10000) + 1000,
      rating: course.rating || (4.0 + Math.random() * 1.0).toFixed(1),
    }));

    // Calculate pagination info
    const totalPages = Math.ceil(totalCourses / limit);
    const currentPage = parseInt(page);

    res.json({
      success: true,
      data: {
        courses: parsedCourses,
        pagination: {
          currentPage: currentPage,
          totalPages: totalPages,
          totalCourses: totalCourses,
          hasNextPage: currentPage < totalPages,
          hasPrevPage: currentPage > 1,
          limit: parseInt(limit)
        },
        category: categoryInfo,
        filters: {
          search: search || null,
          categorySlug: categorySlug
        }
      }
    });

  } catch (err) {
    console.error('Error fetching courses by category:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: err.message 
    });
  }
});

// Get all course categories with slug and course count
router.get('/course-categories', async (req, res) => {
  try {
    const categories = await Course.findAll({
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('id')), 'courseCount']
      ],
      where: {
        category: { [Op.ne]: null }
      },
      group: ['category'],
      raw: true,
    });
    
    const transformedCategories = categories.map((c, index) => ({
      id: index + 1,
      name: c.category,
      slug: generateSlug(c.category),
      courseCount: parseInt(c.courseCount) || 0
    }));

    res.json({
      success: true,
      data: transformedCategories
    });
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: err.message 
    });
  }
});

// Get related courses for a specific course
router.get('/course/:slug/related', async (req, res) => {
  try {
    const { slug } = req.params;
    const { limit = 4 } = req.query;

    // First get the current course
    const currentCourse = await Course.findOne({
      where: { slug: slug }
    });

    if (!currentCourse) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get related courses from same category
    const relatedCourses = await Course.findAll({
      where: {
        category: currentCourse.category,
        slug: { [Op.ne]: slug } // Exclude current course
      },
      order: sequelize.literal('RANDOM()'), // Random order
      limit: parseInt(limit)
    });

    const parsedCourses = relatedCourses.map(course => ({
      ...course.toJSON(),
      tags: safeJsonParse(course.tags),
      whatYoullLearn: safeJsonParse(course.whatYoullLearn),
      categorySlug: generateSlug(course.category),
      students: course.students || Math.floor(Math.random() * 10000) + 1000,
      rating: course.rating || (4.0 + Math.random() * 1.0).toFixed(1),
    }));

    res.json({
      success: true,
      data: parsedCourses
    });
  } catch (err) {
    console.error('Error fetching related courses:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

module.exports = router;
