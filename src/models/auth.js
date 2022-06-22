const db = require("../config/db");
const {v4 : uuidv4} = require('uuid')

const signUp = (body, hashPassword)=>{
    return new Promise((resolve, reject)=>{
        const id = uuidv4()
        const created_at = new Date(Date.now())
        const {email, role_id} = body
        const sqlQuery = "insert into users (id, email, password, role_id, created_at) values($1, $2, $3, $4, $5) returning email, role_id"
        db.query(sqlQuery, [id, email, hashPassword, role_id, created_at])
        .then(result =>{
            resolve(result.rows)
        })
        .catch(err=>{
            reject(err)
        })
    })
}
const getPassByEmail = async (email)=>{
    try {
        const result = await db.query('select id, username, password from users where email = $1', [email])
        if(result.rowCount === 0) throw {status : 400, err : {msg : "Email is not registered"}}
        return result.rows[0]
    } catch (error) {
        throw {error}
    }
}

module.exports = {getPassByEmail, signUp}