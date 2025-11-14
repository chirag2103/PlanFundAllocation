// Admin only middleware
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Coordinator or Admin middleware
export const requireCoordinatorOrAdmin = (req, res, next) => {
  if (!['coordinator', 'admin'].includes(req.user.role)) {
    return res
      .status(403)
      .json({ error: 'Coordinator or Admin access required' });
  }
  next();
};

// Coordinator only middleware
export const requireCoordinator = (req, res, next) => {
  if (req.user.role !== 'coordinator') {
    return res.status(403).json({ error: 'Coordinator access required' });
  }
  next();
};
