const { Course } = require('../models');

const getAllCourses = async (req, res) => {
  try {
    const { category, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;

    // Build where clause for filtering
    const whereCondition = category ? { category } : {};

    // Dynamic sort field and order
    const order = [[sortBy, sortOrder.toUpperCase()]];

    const courses = await Course.findAll({
      where: whereCondition,
      order,
      limit: 10
    });

    const parsedCourses = courses.map(course => ({
      ...course.toJSON(),
      tags: course.tags ? JSON.parse(course.tags) : [],
      whatYoullLearn: course.whatYoullLearn ? JSON.parse(course.whatYoullLearn) : [],
    }));

    res.json(parsedCourses);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// const getAllCourses = async (req, res) => {
//   try {
//     const courses = await Course.findAll();

//     const parsedCourses = courses.map(course => ({
//       ...course.toJSON(),
//       tags: course.tags ? JSON.parse(course.tags) : [],
//       whatYoullLearn: course.whatYoullLearn ? JSON.parse(course.whatYoullLearn) : [],
//     }));

//     res.json(parsedCourses);
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };

module.exports = {
  getAllCourses,
};
