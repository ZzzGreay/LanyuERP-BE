const express = require('express');

const clientRoutes = require('./client.route');
const userRoutes = require('./user.route');
const authRoutes = require('./auth.route');
const projectRoutes = require('./project.route');
const departmentRoutes = require('./department.route');


const router = express.Router();

/**
 * GET /status
 * Simple ping
 */
router.get('/status', (req, res) => res.send('OK'));

/**
 * GET /docs
 */
router.use('/docs', express.static('docs'));

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/departments', departmentRoutes);
router.use('/projects', projectRoutes);
router.use('/clients', clientRoutes);

module.exports = router;
