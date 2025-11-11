const ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer'
};

const PERMISSIONS = {
  // User permissions
  'users:read': [ROLES.ADMIN],
  'users:create': [ROLES.ADMIN],
  'users:update': [ROLES.ADMIN],
  'users:delete': [ROLES.ADMIN],
  
  // Post permissions
  'posts:read': [ROLES.ADMIN, ROLES.EDITOR, ROLES.VIEWER],
  'posts:create': [ROLES.ADMIN, ROLES.EDITOR],
  'posts:update': [ROLES.ADMIN, ROLES.EDITOR],
  'posts:delete': [ROLES.ADMIN],
  
  // Admin specific
  'admin:access': [ROLES.ADMIN]
};

const hasPermission = (role, permission) => {
  return PERMISSIONS[permission]?.includes(role) || false;
};

module.exports = {
  ROLES,
  PERMISSIONS,
  hasPermission
};