const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const createUsers = (body) => {
   return new Promise((resolve, reject) => {
      const { email, password } = body;
      const id = uuidv4();
      const created_at = new Date(Date.now());
      const sqlQuery = 'INSERT INTO users (id, email, password, created_at) VALUES($1, $2, $3, $4) RETURNING email';
      db.query(sqlQuery, [id, email, password, created_at])
         .then(({ rows }) => {
            const response = {
               data: rows[0],
            };
            resolve(response);
         })
         .catch((err) => {
            reject({
               status: 500,
               err,
            });
         });
   });
};

const findUsers = (id) => {
   return new Promise((resolve, reject) => {
      const sqlQuery = 'select * from users where id = $1';
      db.query(sqlQuery, [id])
         .then((data) => {
            if (data.rows.length === 0) {
               return reject({ status: 404, err: 'Users Not Found' });
            }
            const response = {
               data: data.rows,
            };
            resolve(response);
         })
         .catch((err) => {
            reject({ status: 500, err });
         });
   });
};

const updateUsers = (id, file, body) => {
   return new Promise((resolve, reject) => {
      const { username, email, password, gender, description } = body;
      const updated_at = new Date(Date.now());
      let pict = null;
      if (file !== null) {
         pict = file.path;
      }
      const sqlQuery = 'UPDATE users SET username = coalesce($1, username), email = coalesce($2, email), password = coalesce($3, password), gender = coalesce($4, gender), description = coalesce($5, description), pict = coalesce($6, pict), updated_at = $7 WHERE id = $8 RETURNING username, email, password, gender, description, pict, updated_at';
      db.query(sqlQuery, [username, email, password, gender, description, pict, updated_at, id])
         .then((result) => {
            const response = {
               data: result.rows[0],
            };
            resolve(response);
         })
         .catch((err) => {
            reject({
               status: 500,
               err,
            });
         });
   });
};

module.exports = {
   createUsers,
   findUsers,
   updateUsers,
};
