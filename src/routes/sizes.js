const Router = require('express').Router();
const productControllers = require('../controllers/product')

Router.get('/', productControllers.getAllSize)

module.exports = Router;
