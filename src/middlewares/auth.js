const jwt = require("jsonwebtoken");
const db = require("../config/db");
const { client } = require("../config/redis");

const chekDuplicateEmail = async (req, res, next) => {
  try {
    const email = req.body.email;
    const checkEmail = await db.query(`SELECT * FROM users where email = $1`, [
      email,
    ]);
    if (!req.body.email) {
      return res.status(400).json({
        msg: "Please input valid email",
      });
    }
    if (checkEmail.rowCount > 0) {
      return res.status(400).json({
        msg: "Email is already used",
      });
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(400).json({
      msg: "Register failed",
      error,
    });

    console.log(error);
  }
};

const verifyToken = (req, res, next) => {
  const bearerToken = req.header("Authorization");
  if (!bearerToken)
    return res.status(403).json({
      msg: "You need to sign in",
    });
  const oldtoken = bearerToken.split(" ")[1];
  jwt.verify(oldtoken, process.env.JWT_SECRET, async (err, payload) => {
    if (err && err.name === "TokenExpiredError")
      return res.status(401).json({
        msg: "You need to sign in again",
      });
      try {
        const cacheToken = await client.get(`token${payload.id}`)
        if(!cacheToken) {
          return res.status(403).json({
            msg : "Please login first"
          })
        }
        if(cacheToken !== oldtoken){
          return res.status(403).json({
            msg : "Token unauthorized, please login again"
          })
        }
      } catch (error) {
        console.log(error);
        return res.status(400).json({
          error
        })
      }
    req.userPayload = payload;
    next();
  });
};

module.exports = { verifyToken, chekDuplicateEmail };
