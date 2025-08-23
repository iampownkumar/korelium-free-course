const express = require('express');
const router = express.Router();
const localadmincontroller = require('../controllers/localAdminController');
const authenticateLocalAdmin = require('../middleware/authLocalAdmin.js');
const authorizeRoles = require('../middleware/roleAuthorize.js');
// const courseController = require('../controllers/courseController');

router.post('/localadminlogin', localadmincontroller.loginLocalAdmin);//local admin login
router.post('/', authenticateLocalAdmin, localadmincontroller.createLocalAdmin); // create local admin login 

// router.post(
//   '/courses',
//   authenticateLocalAdmin,
//   authorizeRoles('create_course'),
//   courseController.createCourse
// );

// router.put(
//   '/courses/:id',
//   authenticateLocalAdmin,
//   authorizeRoles('update_course'),
//   courseController.updateCourse
// );

// router.delete(
//   '/courses/:id',
//   authenticateLocalAdmin,
//   authorizeRoles('delete_course'),
//   courseController.deleteCourse
// );

// router.get(
//   '/courses',
//   authenticateLocalAdmin,
//   authorizeRoles('read_course'),
//   courseController.getCourses
// );


module.exports = router;
