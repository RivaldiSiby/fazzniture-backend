const express = require('express');
const Router = express.Router();
const middleware = require('../middlewares/auth');

const authControllers = require('../controllers/auth');
const { validateRegister, validateLogin } = require('../middlewares/validasi/validasiauth');

Router.post('/login', validateLogin, authControllers.login);
Router.post('/register', validateRegister, middleware.chekDuplicateEmail, authControllers.register);
Router.delete('/logout', authControllers.logout);

module.exports = Router;
