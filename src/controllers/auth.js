const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { client } = require("../config/redis");
const { getPassByEmail, signUp } = require("../models/auth");

const register = async (req, res) => {
  try {
    const password = req.body.password;
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);
    const result = await signUp(req.body, hashPassword);
    res.status(200).json({
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
      expiresIn: "500s",
    });
    const { username, gender, description, role_id, role, pict } = payload;
    await client.set(`token${payload.id}`, token)
    res.status(200).json({
      msg: "Login Succes",
      datauser: {
        username,
        email,
        gender,
        description,
        role_id,
        role,
        pict,
      },
      token,
    });
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

module.exports = { register, login, logout };
