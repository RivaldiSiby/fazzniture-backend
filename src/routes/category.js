const Router = require('express').Router();
const productControllers = require('../controllers/product')

Router.get('/', productControllers.getAllCategory)

module.exports = Router;
