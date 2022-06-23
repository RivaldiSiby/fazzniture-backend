const Router = require('express').Router();

const userController = require('../controllers/users');
const { upload } = require('../middlewares/upload');

Router.post('/', userController.postUsersControllers);
Router.get('/:id', userController.findUsersControllers);
Router.patch('/:id', upload, userController.patchUsersControllers);

module.exports = Router;
