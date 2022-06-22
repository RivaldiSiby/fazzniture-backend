const Router = require('express').Router();

const pingRouter = require('./ping');
const authRouter = require('./auth')

Router.use('/ping', pingRouter);
Router.use('/auth', authRouter)

module.exports = Router;
