const usersModels = require('../models/users');

const { createUsers, findUsers, updateUsers } = usersModels;

const postUsersControllers = (req, res) => {
   createUsers(req.body)
      .then((data) => {
         res.status(200).json({
            msg: 'Created users success',
            data,
         });
      })
      .catch((err) => {
         res.status(500).json({
            err,
            data: [],
         });
      });
};

const findUsersControllers = (req, res) => {
   const id = req.params.id;
   findUsers(id)
      .then(({ data }) => {
         res.status(200).json({
            data,
            err: null,
         });
      })
      .catch((error) => {
         const { err, status } = error;
         res.status(status).json({
            data: [],
            err,
         });
      });
};

const patchUsersControllers = (req, res) => {
   const id = req.params.id;
   //    const { file = null } = req;
   updateUsers(id, req.body)
      .then((result) => {
         const { data } = result;
         res.status(200).json({
            msg: 'Update successfull',
            data,
         });
      })
      .catch((err) => {
         res.status(500).json({
            err,
            data: [],
         });
      });
};

module.exports = {
   postUsersControllers,
   findUsersControllers,
   patchUsersControllers,
};
