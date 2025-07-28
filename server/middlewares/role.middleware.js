function checkRole(role) {
  return (req, res, next) => {
    console.log('Role middleware - User:', req.user);
    console.log('Role middleware - Required role:', role);
    console.log('Role middleware - User role:', req.user?.role);
    
    if (!req.user) {
      console.log('Role middleware - No user found');
      return res.status(401).json({ status: "error", message: "Access denied: No token provided" });
    }

    if (req.user.role.toLowerCase().trim() !== role.toLowerCase().trim()) {
      console.log('Role middleware - Role mismatch:', req.user.role, '!==', role);
      return res.status(403).json({ status: "error", message: "Not authorized" });
    }

    console.log('Role middleware - Access granted');
    next();
  };
}
export { checkRole };
