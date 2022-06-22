const Router = require('express').Router();

Router.get('/', (req, res) => {
   res.json({
      msg: 'pong',
   });
});

module.exports = Router;
