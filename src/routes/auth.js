const express = require('express')
const Router = express.Router()

const authControllers = require('../controllers/auth')

Router.post('/login', authControllers.login)
Router.post('/register', authControllers.register)

module.exports = Router