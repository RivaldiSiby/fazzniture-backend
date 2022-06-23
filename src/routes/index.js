const Router = require('express').Router();

const pingRouter = require('./ping');
const usersRoutes = require('./users');
const authRouter = require('./auth');
const productRouter = require('./product');

Router.use('/ping', pingRouter);
Router.use('/users', usersRoutes);
Router.use('/auth', authRouter);
Router.use('/product', productRouter);

module.exports = Router;
