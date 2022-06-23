const Router = require('express').Router();

const pingRouter = require('./ping');
const usersRoutes = require('./users');
const authRouter = require('./auth')

Router.use('/ping', pingRouter);
Router.use('/users', usersRoutes);
Router.use('/auth', authRouter)

module.exports = Router;
