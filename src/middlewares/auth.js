const jwt = require('jsonwebtoken')
const db = require('../config/db')

const chekDuplicateEmail = async (req, res, next)=>{
    try {
        const checkEmail = db.query(`SELECT * FROM users where email = ${req.body.email}`)
        if(!req.body.email){
            return res.status(400).json({
                msg : "Please input valid email"
            })
        }
        if(checkEmail === 0){
            return res.status(400).json({
                msg : "Email is already used"
            })
        }
    } catch (error) {
        res.status(400).json({
            msg : "Register failed",
            error
        })
        console.log(error);
    }
}

const verifyToken = (req, res, next)=>{
    const bearerToken = req.header('Authorization')
    if(!bearerToken) return res.status(403).json({
        msg : "You need to sign in"
    })
    const oldtoken = bearerToken.split(" ")[1]
    jwt.verify(oldtoken, process.env.JWT_SECRET, (err, payload)=>{
        if (err && err.name === "TokenExpiredError") return res.status(401).json({
            msg : "You need to sign in again"
        })
        req.userPayload = payload
        next()
    })
}

module.exports = {verifyToken, chekDuplicateEmail}