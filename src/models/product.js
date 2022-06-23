const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const createProducts = (body) => {
   return new Promise((resolve, reject) => {
      const { name, description, brands_id, category_id } = body;
      const id = uuidv4();
      const created_at = new Date(Date.now());
      const updated_at = created_at;
      const sqlQuery = 'INSERT INTO product (id, name, description, brands_id, category_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7) returning id';
      db.query(sqlQuery, [id, name, description, brands_id, category_id, created_at, updated_at])
         .then((result) => {
            const response = result.rows[0];
            resolve(response.id);
         })
         .catch((err) => {
            reject({ status: 500, err });
         });
   });
};

const createSize = (body, product_id) => {
   return new Promise((resolve, reject) => {
      const { size, price } = body;
      const id = uuidv4();
      const created_at = new Date(Date.now());
      const updated_at = created_at;
      const sqlQuery = 'INSERT INTO size (id, size, price, product_id, created_at, updated_at) values ($1, $2, $3, $4, $5, $6)';
      db.query(sqlQuery, [id, size, price, product_id, created_at, updated_at])
         .then((result) => {
            resolve(result);
         })
         .catch((err) => {
            reject({
               status: 500,
               err,
            });
         });
   });
};

const createFile = (file, product_id) => {
   return new Promise((resolve, reject) => {
      const id = uuidv4();
      const created_at = new Date(Date.now());
      const updated_at = created_at;
      const pict = file ? file.path : null;
      const sqlQuery = 'INSERT into files (id, file, product_id, created_at, updated_at) values ($1, $2, $3, $4, $5)';
      db.query(sqlQuery, [id, pict, product_id, created_at, updated_at])
         .then((result) => {
            resolve(result);
         })
         .catch((error) => {
            reject({
               status: 500,
               error,
            });
         });
   });
};

const getSingleProducts = async (id) => {
   try {
      const sqlQuery = 'select p.id,p."name",p.description,c."name" ,b."name",b.description, s."size" ,s.price ,p.created_at ,p.updated_at from product p left join "size" s on s.product_id = p.id inner join brands b on b.id = p.brands_id inner join category c on c.id = p.category_id where p.id = $1';
      const getFile = 'SELECT file FROM files where product_id = $1';
      const data = await db.query(sqlQuery, [id]);
      const file = await db.query(getFile, [id]);
      return {
         data: data.rows[0],
         file: file.rows,
      };
   } catch (error) {
      console.log(error);
      throw error;
   }
};

const getAllProduct = async () => {
   try {
      const sqlQuery = 'select  p.id,p."name",p.description,c."name" ,b."name",b.description, s."size" ,s.price,f.file  ,p.created_at ,p.updated_at  from product p left join "size" s on s.product_id = p.id inner join brands b on b.id = p.brands_id inner join category c on c.id = p.category_id inner join files f on f.product_id = p.id';
      const data = await db.query(sqlQuery);
      return {
         data: data.rows,
      };
   } catch (error) {
      console.log(error);
      throw error;
   }
};

const getAllFavorite = async () => {
   try {
      const sqlQuery = 'select p.id ,p."name" ,s.size_id ,s2."size" ,s2.price ,f.file ,count(quantity) as selling ,p.created_at ,p.updated_at  from sales s inner join "size" s2 on s2.id = s.size_id inner join product p on s2.product_id = p.id inner join files f on f.product_id = p.id group by s.size_id, s2.id, p.id, f.id';
      const data = await db.query(sqlQuery);
      return {
         data: data.rows,
      };
   } catch (error) {
      console.log(error);
      throw error;
   }
};

// nama, desc, foto, price
const updateProduct = async (id, body) => {
   try {
      const { name, description } = body;
      const updated_at = new Date(Date.now());
      const sqlQuery = "UPDATE product SET name = coalesce(nullif($1, ''), name), description = coalesce(nullif($2, ''), description), updated_at = $3 where id = $4 returning *";
      const data = await db.query(sqlQuery, [name, description, updated_at, id]);
      return data.rows;
   } catch (error) {
      console.log(error);
      throw error;
   }
};

const updateSize = async (body) => {
   try {
      const { price, size_id } = body;
      const updated_at = new Date(Date.now());
      const sqlQuery = "UPDATE size SET price = coalesce(nullif($1, '')::int, price), updated_at = $2 where id = $3 returning *";
      const data = await db.query(sqlQuery, [price, updated_at, size_id]);
      return data.rows;
   } catch (error) {
      console.log(error);
      throw error;
   }
};

module.exports = {
   createProducts,
   createSize,
   createFile,
   getSingleProducts,
   getAllProduct,
   getAllFavorite,
   updateProduct,
   updateSize,
};
