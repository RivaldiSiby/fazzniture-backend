const { check, validationResult } = require('express-validator');

const validateRegister = [
   check('email').isEmail().notEmpty().trim().escape(),
   check('password').notEmpty(),
   check('role_id').notEmpty().isNumeric(),
   (req, res, next) => {
      const errorFormatter = ({ msg, param }) => {
         // Build your resulting errors however you want! String, object, whatever - it works!
         return `${param} ${msg}`;
      };
      const result = validationResult(req).formatWith(errorFormatter);
      if (!result.isEmpty()) {
         return res.status(400).json(result.mapped());
      }
      next();
   },
];

const validateLogin = [
   check('email').isEmail().notEmpty().trim().escape(),
   check('password').notEmpty(),
   (req, res, next) => {
      const errorFormatter = ({ msg, param }) => {
         // Build your resulting errors however you want! String, object, whatever - it works!
         return `${param} ${msg}`;
      };
      const result = validationResult(req).formatWith(errorFormatter);
      if (!result.isEmpty()) {
         return res.status(400).json(result.mapped());
      }
      next();
   },
];

module.exports = {
   validateRegister,
   validateLogin,
};
