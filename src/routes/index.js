const Router = require('express').Router();

const pingRouter = require('./ping');
const usersRoutes = require('./users');

Router.use('/ping', pingRouter);
Router.use('/users', usersRoutes);

module.exports = Router;
