const {
    createSales, 
    createTransactions, 
    getAllTransactions, 
    getDetailTransactions,
    getSalesByTransactionid,
    softDeleteTransaction
} = require('../models/transactions')

const createNewTransaction = async (req, res)=>{
    try {
        const user_id = req.userPayload.id
        const result = await createTransactions(req.body, user_id)
        const products = req.body.products
        const waitingProduct = new Promise((resolve, reject)=>{
            let countData = 0
            products.map(async product=>{
                try {
                    await createSales(product, result)
                    countData += 1
                    if(countData === products.length){
                        return  resolve()
                    }
                } catch (error) {
                    console.log(error);
                    reject(error)
                }
            })
        })
        await waitingProduct
        res.status(200).json({
            msg : `Succes create transaction`,
            id : result
        })
    } catch (error) {
        res.status(400).json({
            msg : `Cannot create transaction`
        })
        console.log(error);
    }
}

const showAllTransactions = async (req, res)=>{
    try {
        const result = await getAllTransactions()
        res.status(200).json({
            msg : "Show all transaction", 
            data : result
        })
    } catch (error) {
        console.log(error);
        res.status(400).json({
            msg : "Failed get all transaction",
            error
        })
    }
}

const showDetailTransaction = async (req, res)=>{
    try {
        const {id} = req.params
        const result = await getDetailTransactions(id)
        const product = await getSalesByTransactionid(id)
        res.status(200).json({
            msg : "Show detail transaction",
            data : {
                result,
                product
            }
        })
    } catch (error) {
        res.status(400).json({
            msg : "Cannot get detail transaction",
            error
        })
        console.log(error);
    }
}

const deleteTransaction = async (req, res)=>{
    try {
        const {id} = req.params
        await softDeleteTransaction(id)        
        res.status(200).json({
            msg : "Succes delete transaction",
            data : {id}
        })
    } catch (error) {
        console.log(error)
        res.status(400).json({
            msg : "cannot delete transaction",
            error
        })
    }
}

module.exports = {createNewTransaction, showAllTransactions, showDetailTransaction, deleteTransaction}