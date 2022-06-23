const express = require('express')
const Router = express.Router()
const middleware = require('../middlewares/auth')

const authControllers = require('../controllers/auth')

Router.post('/login', authControllers.login)
Router.post('/register', middleware.chekDuplicateEmail, authControllers.register)

module.exports = Router