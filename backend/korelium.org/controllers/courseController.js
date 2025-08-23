// Import necessary modules and classes
const { Course } = require('../models'); // Import the Course model class
const fs = require('fs'); // Import the built-in file system module for file operations

/**
 * Get all courses
 */
const getAllCourses = async (req, res) => {
  try {
    // Find all courses with a limit of 10
    const courses = await Course.findAll({
      // limit: 10,
    });

    // Parse the course data to convert tags and whatYoullLearn fields from JSON strings to arrays
    const parsedCourses = courses.map((course) => {
      return {
        ...course.dataValues, // Get the original course object properties
        tags: JSON.parse(course.tags || '[]'), // Convert tags field from JSON string to array
        whatYoullLearn: course.whatYoullLearn ? JSON.parse(course.whatYoullLearn) : null, // Parse whatYoullLearn field from JSON string to array (or set to null if empty)
      };
    });

    res.json(parsedCourses); // Return the parsed courses in JSON format
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message }); // Return a server error response with the error message
  }
};

/**
 * Create a new course
 */
const createCourse = async (req, res) => {
  try {
    let imagePath = null; // Initialize imagePath variable to store the uploaded image path

    if (req.file) { // Check if an image file was uploaded
      imagePath = req.file.path.replace(/\\/g, '/'); // Get the uploaded image path and replace backslashes with forward slashes
    }

    // Parse tags and whatYoullLearn fields from JSON strings to arrays
    let tagsValue = req.body.tags;
    if (tagsValue && typeof tagsValue === 'string') {
      try {
        tagsValue = JSON.parse(tagsValue); // Try to parse the tags field as a JSON string
      } catch (e) {
        tagsValue = []; // If parsing fails, set tagsValue to an empty array
      }
    }
    if (Array.isArray(tagsValue)) { // Check if tagsValue is an array and stringify it for database storage
      tagsValue = JSON.stringify(tagsValue);
    }

    let whatYoullLearnValue = req.body.whatYoullLearn;
    if (whatYoullLearnValue && typeof whatYoullLearnValue === 'string') {
      try {
        whatYoullLearnValue = JSON.parse(whatYoullLearnValue); // Try to parse the whatYoullLearn field as a JSON string
      } catch (e) {
        whatYoullLearnValue = []; // If parsing fails, set whatYoullLearnValue to an empty array
      }
    }
    if (Array.isArray(whatYoullLearnValue)) { // Check if whatYoullLearnValue is an array and stringify it for database storage
      whatYoullLearnValue = JSON.stringify(whatYoullLearnValue);
    }

    const courseData = {
      title: req.body.title,
      slug: req.body.slug,
      description: req.body.description,
      image: imagePath, // Set the uploaded image path
      category: req.body.category,
      tags: tagsValue, // Store the parsed tags field as a JSON string
      instructor: req.body.instructor,
      duration: req.body.duration,
      students: req.body.students,
      rating: req.body.rating,
      udemyLink: req.body.udemyLink,
      fullDescription: req.body.fullDescription,
      prerequisites: req.body.prerequisites,
      level: req.body.level,
      language: req.body.language,
      lastUpdated: req.body.lastUpdated,
      certificate: req.body.certificate,
      whatYoullLearn: whatYoullLearnValue, // Store the parsed whatYoullLearn field as a JSON string
    };

    const course = await Course.create(courseData); // Create a new course in the database

    // Parse back to array/object for tags and whatYoullLearn fields in the response
    const parsedCourse = {
      ...course.toJSON(), // Get the original course object properties
      tags: course.tags ? JSON.parse(course.tags) : [], // Convert tags field from JSON string to array (or set to empty array if null)
      whatYoullLearn: course.whatYoullLearn ? JSON.parse(course.whatYoullLearn) : [], // Parse whatYoullLearn field from JSON string to array (or set to empty array if null)
    };

    res.status(201).json({ message: 'Course created successfully', course: parsedCourse }); // Return a successful creation response with the parsed course
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message }); // Return a server error response with the error message
  }
};

/**
 * Update an existing course
 */
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id); // Find the course by ID

    if (!course) { // Check if the course exists
      return res.status(404).json({ message: 'Course not found' }); // Return a not found response
    }

    // Handle new image upload (optional)
    let imagePath = course.image; // Keep the old image path if no new image is uploaded

    if (req.file) { // Check if an image file was uploaded
      // Optionally, delete the old image file
      if (course.image && fs.existsSync(course.image)) {
        fs.unlinkSync(course.image);
      }
      imagePath = req.file.path.replace(/\\/g, '/'); // Get the new image path and replace backslashes with forward slashes
    }

    // Parse array fields
    let tagsValue = req.body.tags;
    if (tagsValue && typeof tagsValue === 'string') {
      try {
        tagsValue = JSON.parse(tagsValue); // Try to parse the tags field as a JSON string
      } catch (e) {
        tagsValue = []; // If parsing fails, set tagsValue to an empty array
      }
    }
    if (Array.isArray(tagsValue)) { // Check if tagsValue is an array and stringify it for database storage
      tagsValue = JSON.stringify(tagsValue);
    }

    let whatYoullLearnValue = req.body.whatYoullLearn;
    if (whatYoullLearnValue && typeof whatYoullLearnValue === 'string') {
      try {
        whatYoullLearnValue = JSON.parse(whatYoullLearnValue); // Try to parse the whatYoullLearn field as a JSON string
      } catch (e) {
        whatYoullLearnValue = []; // If parsing fails, set whatYoullLearnValue to an empty array
      }
    }
    if (Array.isArray(whatYoullLearnValue)) { // Check if whatYoullLearnValue is an array and stringify it for database storage
      whatYoullLearnValue = JSON.stringify(whatYoullLearnValue);
    }

    const updateData = {
      title: req.body.title ?? course.title, // Update the title field with new value or keep old value if no change
      slug: req.body.slug ?? course.slug,
      description: req.body.description ?? course.description,
      image: imagePath, // Set the uploaded image path
      category: req.body.category ?? course.category,
      tags: tagsValue ?? course.tags, // Store the parsed tags field as a JSON string (or keep old value if no change)
      instructor: req.body.instructor ?? course.instructor,
      duration: req.body.duration ?? course.duration,
      students: req.body.students ?? course.students,
      rating: req.body.rating ?? course.rating,
      udemyLink: req.body.udemyLink ?? course.udemyLink,
      fullDescription: req.body.fullDescription ?? course.fullDescription,
      prerequisites: req.body.prerequisites ?? course.prerequisites,
      level: req.body.level ?? course.level,
      language: req.body.language ?? course.language,
      lastUpdated: req.body.lastUpdated ?? course.lastUpdated,
      certificate: req.body.certificate ?? course.certificate,
      whatYoullLearn: whatYoullLearnValue ?? course.whatYoullLearn, // Store the parsed whatYoullLearn field as a JSON string (or keep old value if no change)
    };

    await course.update(updateData); // Update the course in the database

    // Parse arrays for response
    const parsedCourse = {
      ...course.toJSON(), // Get the original course object properties
      tags: course.tags ? JSON.parse(course.tags) : [], // Convert tags field from JSON string to array (or set to empty array if null)
      whatYoullLearn: course.whatYoullLearn ? JSON.parse(course.whatYoullLearn) : [], // Parse whatYoullLearn field from JSON string to array (or set to empty array if null)
    };

    res.json({ message: 'Course updated successfully', course: parsedCourse }); // Return a successful update response with the parsed course
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message }); // Return a server error response with the error message
  }
};

/**
 * Delete a course by ID
 */
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id); // Find the course by ID

    if (!course) { // Check if the course exists
      return res.status(404).json({ message: 'Course not found' }); // Return a not found response
    }

    // Optionally, delete the course image file
    if (course.image && fs.existsSync(course.image)) {
      fs.unlinkSync(course.image);
    }

    await course.destroy(); // Delete the course in the database

    res.json({ message: 'Course deleted successfully' }); // Return a successful deletion response
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message }); // Return a server error response with the error message
  }
};

module.exports = {
  getAllCourses,
  createCourse,
  updateCourse,
  deleteCourse,
};

