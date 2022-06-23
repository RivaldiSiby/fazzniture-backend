const Router = require('express').Router();

const userController = require('../controllers/users');

Router.post('/', userController.postUsersControllers);
Router.get('/:id', userController.findUsersControllers);
Router.patch('/:id', userController.patchUsersControllers);

module.exports = Router;
