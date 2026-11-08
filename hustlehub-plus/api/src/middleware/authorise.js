export function authorise(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      req.log.warn(
        {
          event: 'access.denied',
          userId: req.user?.id,
          role: req.user?.role,
          required: allowedRoles,
          path: req.originalUrl,
        },
        'Access denied'
      );
      return res.status(403).json({ error: 'Permission denied, invalid role.' });
    }
    next();
  };
}
