const express = require('express');
const authRoutes = require('./auth.route');
const userRoutes = require('./user.route');
const workLogRoutes = require('./workLog.route');
const workItemRoutes = require('./workItem.route');

const siteRoutes = require('./site.route');

const router = express.Router();

router.get('/status', (req, res) => res.send('OK'));
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/workLogs', workLogRoutes);
router.use('/workItems', workItemRoutes);
router.use('/sites', siteRoutes);
module.exports = router;

