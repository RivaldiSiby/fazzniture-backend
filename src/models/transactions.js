const db = require('../config/db')
const {v4 : uuidv4} = require('uuid')


const createTransactions = (body, user_id)=>{
    return new Promise((resolve, reject)=>{
        const {shiping_id, payment_id} = body
        const id = uuidv4()
        const created_at = new Date(Date.now())
        db.query(`insert into transaction(id, shiping_id, payment_id, user_id, created_at, updated_at) values($1,$2,$3,$4, $5, $6) returning id`, [id, shiping_id, payment_id, user_id, created_at, created_at] )
        .then(result =>{
            resolve(result.rows[0].id)
        })
        .catch(err=>{
            reject(err)
        })
    })
}

const createSales = async (body, transaction_id)=>{
    try {
        const {size_id, quantity, total} = body
        const id = uuidv4()
        const result = await db.query('insert into sales(id, size_id, transaction_id, quantity, total) values($1, $2, $3, $4, $5)', [id, size_id, transaction_id, quantity, total])
        return result.rows
    } catch (error) {
        console.log(error);
        throw error
    }
}

const getAllTransactions = ()=>{
    return new Promise((resolve, reject)=>{
        db.query('select t.id ,s2."method" as "shiping_method",p."method" as "payment_method" ,sum(s.total) as total,count(s.id) as quantity_items,  t.created_at ,t.updated_at from "transaction" t left join sales s on s.transaction_id = t.id inner join shiping s2 on t.shiping_id = s2.id inner join payment p on t.payment_id = p.id  group by t.id,s2.id,p.id')
        .then(result=>{
            resolve(result.rows)
        })
        .catch(err=>{
            reject(err)
        })
    })
}

const getDetailTransactions = (id)=>{
    return new Promise((resolve, reject)=>{
        const sqlQuery = 'select t.id ,s2."method" as "shiping_method",p."method" as "payment_method" ,sum(s.total) as total,count(s.id) as quantity_items,  t.created_at ,t.updated_at from "transaction" t left join sales s on s.transaction_id = t.id inner join shiping s2 on t.shiping_id = s2.id inner join payment p on t.payment_id = p.id where t.id = $1 group by t.id,s2.id,p.id'
        db.query(sqlQuery, [id])
        .then(result=>{
            resolve(result.rows)
        })
        .catch(err=>{
            reject(err)
        })
    })
}

const getSalesByTransactionid = (id)=>{
    return new Promise((resolve, reject)=>{
        db.query('select s.id,p."name" ,p.description,s2."size" ,s2.price ,s.quantity ,s.total from sales s inner join "size" s2 on s.size_id = s2.id inner join product p on s2.product_id = p.id where s.transaction_id = $1', [id])
    .then(result =>{
        resolve(result.rows[0])
    })
    .catch(err=>{
        reject(err)
    })
    })
}

const softDeleteTransaction = (id)=>{
    return new Promise((resolve, reject)=>{
        const deleted_at = new Date(Date.now())
        db.query("update transaction set deleted_at = $1 where id = $2", [deleted_at, id])
        .then((result)=>{
            resolve(result.rows[0])
        })
        .catch((err)=>{
            reject(err)
        })
    })
}

module.exports = {
    createSales, 
    createTransactions, 
    getAllTransactions, 
    getDetailTransactions,
    getSalesByTransactionid,
    softDeleteTransaction
}