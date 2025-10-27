const auth = (req, res, next) => {
  if (req.session && req.session.user) {
    req.user = req.session.user;
    next();
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
};

// Employee only middleware
const requireEmployee = (req, res, next) => {
  if (req.user && req.user.type === 'employee') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Employee role required.' });
  }
};

// Customer only middleware
const requireCustomer = (req, res, next) => {
  if (req.user && req.user.type === 'customer') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Customer access only.' });
  }
};

module.exports = { auth, requireEmployee, requireCustomer };