const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { client } = require("../config/redis");
const { getPassByEmail, signUp, editPassword } = require("../models/auth");
const nodemailer = require('nodemailer')

const register = async (req, res) => {
  try {
    const password = req.body.password;
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);
    const result = await signUp(req.body, hashPassword);
    res.status(201).json({
      msg: "Register Succes",
      data: result,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      msg: "Register Failed",
      error,
    });
  }
};
// const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const payload = await getPassByEmail(email);
//     const result = await bcrypt.compare(password, payload.password);
//     if (!result) {
//       return res.status(400).json({
//         msg: "Wrong email or password",
//       });
//     }

// }
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const payload = await getPassByEmail(email);
    const result = await bcrypt.compare(password, payload.password);
    if (!result) {
      return res.status(400).json({
        msg: "Email or password is incorrect",
      });
    }
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1000s",
    });
    const { username, gender, description, role_id, role, pict } = payload;
    await client.set(`token${payload.id}`, token)
    res.status(200).json({
      msg: "Login Succes",
      datauser: {
//     res.status(200).json({
//       msg: "Login Succes",
//       datauser: {
//         username,
//         email,
//         gender,
//         description,
//         role_id,
//         role,
//         pict,
//       },
//       token,
//     });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      msg: "Login Failed",
      error,
    });
  }
};
  
const logout = async (req, res) => {
  try {
//     const bearerToken = req.header("Authorization");
//     const oldtoken = bearerToken.split(" ")[1];
//     jwt.verify(oldtoken, process.env.JWT_SECRET, (err, data) => {
//       if (err) res.status(500).json({ msg: "cannot logout" });
//       localStorage.removeItem(`token${data.id}`);
//       res.status(200).json({
//         msg: "Logout succes",
//       });
//     });
    const {id} = req.userPayload
    console.log(id);
    const cacheToken = await client.get(`token${id}`)
    if(!cacheToken){
      return res.status(403).json({
        msg : "You need to sign in"
      })
    }
    if(cacheToken){
      await client.del(`token${id}`)
    }

    res.status(200).json({
      msg : "Logout succes"
    })
  } catch (error) {
    console.log(error);
    res.status(400).json({
      msg: "Logout failed",
    });
  }
};
  
  const forgotPassword = async (req, res)=>{
  try {
      const email = req.body.email
      const transporter = nodemailer.createTransport({
          host : process.env.DB_HOST,
          service : process.env.SERVICE,
          port : 587,
          secure : true,
          auth : {
              user : process.env.USER,
              pass : process.env.PASS
          }
      })
      const result = await getPassByEmail(email)
      const token = jwt.sign(result, process.env.JWT_SECRET, {
          expiresIn : "300s"
      })
      await transporter.sendMail({
          from : process.env.USER,
          to : email,
          subject : `Reset Password`,
          text : `Click link bellow to reset your password
          ${process.env.BASE_URL}reset-password/${token}
          
          Your link will be expired in 5 minutes
          `
      })
      res.status(200).json({
          msg : "Email send succesfully",
          token
      })
  } catch (error) {
      console.log(error, "Email send failed");
      res.status(400).json({
          msg : "Failed send email"
      })
  }
}

const resetPassword = async (req, res)=>{
  try {
      const {newPassword, confirmPassword} = req.body
      if(newPassword!== confirmPassword){
          return res.status(400).json({
              msg : "New password and confirm password is incorrect"
          })
      }
      const salt = await bcrypt.genSalt()
      const hashPassword = await bcrypt.hash(newPassword, salt)
      const bearerToken = req.header("Authorization");
      const token = bearerToken.split(" ")[1];
      jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
          if(err && err.name === "TokenExpiredError")
          return res.status(401).json({
          msg: "Link is expired",
          });
          await editPassword(payload.id, hashPassword)
          res.status(200).json({
              msg : "Succes reset password"
          })
      })
  } catch (error) {
      console.log(error);
      res.status(400).json({
          msg : "Failed to reset password",
          error
      })
  }
}


module.exports = { register, login, logout, forgotPassword, resetPassword};
