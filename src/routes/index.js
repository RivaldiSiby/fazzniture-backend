const Router = require('express').Router();

const pingRouter = require('./ping');
const usersRoutes = require('./users');
const authRouter = require('./auth')
const transactionRouter = require('./transactions')

Router.use('/ping', pingRouter);
Router.use('/users', usersRoutes);
Router.use('/auth', authRouter)
Router.use('/transaction', transactionRouter)

module.exports = Router;
