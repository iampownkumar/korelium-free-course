// Allowed actions can be: 'create_course', 'read_course', 'update_course', 'delete_course', 'manage_comments', etc.

const rolePermissions = {
  course_creator: ['create_course', 'read_course'],
  course_manager: ['read_course', 'update_course', 'delete_course'],
  comment_manager: ['manage_comments'],
};

function authorizeRoles(...allowedActions) {
  return (req, res, next) => {
    const userRole = req.localAdmin.role; // assuming req.localAdmin is set by auth middleware

    if (!userRole) {
      return res.status(403).json({ message: 'Role not found for user' });
    }

    const permissions = rolePermissions[userRole] || [];

    // Check if user's role has at least one allowed action
    const hasPermission = allowedActions.some(action => permissions.includes(action));

    if (!hasPermission) {
      return res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }

    next();
  };
}

module.exports = authorizeRoles;
