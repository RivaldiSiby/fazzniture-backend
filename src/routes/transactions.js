const express = require('express')
const Router = express.Router()
const {verifyToken} = require('../middlewares/auth')

const transactionControllers = require('../controllers/transactions')

Router.post('/', verifyToken, transactionControllers.createNewTransaction)
Router.get('/all', transactionControllers.showAllTransactions)
Router.get('/:id', transactionControllers.showDetailTransaction)
Router.patch('/:id', transactionControllers.deleteTransaction)

module.exports = Router