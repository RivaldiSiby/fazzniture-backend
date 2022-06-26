const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

const createTransactions = (body, user_id) => {
  return new Promise((resolve, reject) => {
    const { shipping_id, payment_id, seller_id, status } = body;
    const id = uuidv4();
    const created_at = new Date(Date.now());
    db.query(
      `insert into transaction(id, shipping_id, payment_id, user_id,seller_id,status, created_at, updated_at) values($1,$2,$3,$4, $5, $6,$7,$8) returning id`,
      [
        id,
        shipping_id,
        payment_id,
        user_id,
        seller_id,
        status,
        created_at,
        created_at,
      ]
    )
      .then((result) => {
        resolve(result.rows[0].id);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const createSales = async (body, transaction_id) => {
  try {
    const { stock_id, quantity, total } = body;
    const id = uuidv4();
    const result = await db.query(
      "insert into sales(id, stock_id, transaction_id, quantity, total) values($1, $2, $3, $4, $5)",
      [id, stock_id, transaction_id, quantity, total]
    );
    return result.rows;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getAllTransaction = async (query) => {
  const byStatus = Object.keys(query).find((item) => item === "status");
  const bySort = Object.keys(query).find((item) => item === "sort");
  const byOrder = Object.keys(query).find((item) => item === "order");

  let queryList = [];
  let queryKey = [];
  let querySort = "";
  let textQuery = "";
  if (byStatus !== undefined) {
    textQuery += `lower(t.status) LIKE lower('%' || $1 || '%') AND`;
    queryList.push({ query: "status", value: query.status });
    queryKey.push(query.status);
  }
  //   limit
  //   pagination
  const { page = 1, limit = 12 } = query;
  const offset = parseInt(page - 1) * parseInt(limit);
  const paginationSql = ` LIMIT $${queryKey.length + 1} OFFSET $${
    queryKey.length + 2
  }`;

  return new Promise((resolve, reject) => {
    db.query(
      "select t.id ,s2.method as shipping_method,p.method as payment_method ,sum(s.total) as total,count(s.id) as quantity_items,t.status,u.store as seller,t.seller_id,u2.username as coustomer,t.user_id as coustomer_id, t.created_at ,t.updated_at from transaction t left join sales s on s.transaction_id = t.id inner join shipping s2 on t.shipping_id = s2.id inner join payment p on t.payment_id = p.id inner join users u on u.id = t.seller_id inner join users u2 on u2.id = t.user_id WHERE " +
        textQuery +
        " t.deleted_at = 'false' group by t.id,s2.id,p.id,u.id,u2.id ",
      queryKey.length !== 0 ? queryKey : ""
    )
      .then((countData) => {
        //  handler sort
        if (bySort !== undefined) {
          if (query.sort === "time") {
            querySort = "ORDER BY t.created_at";
            querySort += byOrder === undefined ? "asc" : query.order;
          }

          if (query.sort === "price") {
            querySort = "ORDER BY total ";
            querySort += byOrder === undefined ? "asc" : query.order;
          }

          queryList.push({ query: "sort", value: query.sort });
        }

        queryKey.push(limit);
        queryKey.push(offset);

        db.query(
          "select t.id ,s2.method as shipping_method,p.method as payment_method ,sum(s.total) as total,count(s.id) as quantity_items,t.status,u.store as seller,t.seller_id,u2.username as coustomer,t.user_id as coustomer_id, t.created_at ,t.updated_at from transaction t left join sales s on s.transaction_id = t.id inner join shipping s2 on t.shipping_id = s2.id inner join payment p on t.payment_id = p.id inner join users u on u.id = t.seller_id inner join users u2 on u2.id = t.user_id WHERE " +
            textQuery +
            " t.deleted_at = 'false' group by t.id,s2.id,p.id,u.id,u2.id " +
            querySort +
            paginationSql,
          queryKey.length !== 0 ? queryKey : ""
        )
          .then((result) => {
            const totalData = countData.rowCount;
            const totalPage = Math.ceil(totalData / parseInt(limit));

            const data = {
              data: result.rows,
              totalData: totalData,
              totalPage: totalPage,
              query: queryList,
            };
            resolve(data);
          })
          .catch((err) => {
            reject(err);
          });
      })
      .catch((err) => {
        reject(err);
      });
  });
};
const getAllTransactionsUser = (query, id) => {
  const byStatus = Object.keys(query).find((item) => item === "status");
  const bySort = Object.keys(query).find((item) => item === "sort");
  const byOrder = Object.keys(query).find((item) => item === "order");

  let queryList = [];
  let queryKey = [];
  let querySort = "";
  let textQuery = "";
  queryKey.push(id);
  if (byStatus !== undefined) {
    textQuery += `lower(t.status) LIKE lower('%' || $${
      queryKey.length + 1
    } || '%') AND `;
    queryList.push({ query: "status", value: query.status });
    queryKey.push(query.status);
  }
  //   limit
  //   pagination
  const { page = 1, limit = 12 } = query;
  const offset = parseInt(page - 1) * parseInt(limit);
  const paginationSql = ` LIMIT $${queryKey.length + 2} OFFSET $${
    queryKey.length + 2
  }`;

  return new Promise((resolve, reject) => {
    db.query(
      "select t.id ,s2.method as shipping_method,p.method as payment_method ,sum(s.total) as total,count(s.id) as quantity_items,t.status,u.store as seller,t.seller_id, t.created_at ,t.updated_at from transaction t left join sales s on s.transaction_id = t.id inner join shipping s2 on t.shipping_id = s2.id inner join payment p on t.payment_id = p.id inner join users u on u.id = t.seller_id Where t.user_id = $1 and" +
        textQuery +
        " t.deleted_at group by t.id,s2.id,p.id,u.id" +
        queryKey.length !==
        0
        ? queryKey
        : ""
    )
      .then((countData) => {
        //  handler sort
        if (bySort !== undefined) {
          if (query.sort === "time") {
            querySort = "ORDER BY t.created_at";
            querySort += byOrder === undefined ? "asc" : query.order;
          }

          if (query.sort === "price") {
            querySort = "ORDER BY total ";
            querySort += byOrder === undefined ? "asc" : query.order;
          }

          queryList.push({ query: "sort", value: query.sort });
        }

        queryKey.push(limit);
        queryKey.push(offset);

        db.query(
          "select t.id ,s2.method as shipping_method,p.method as payment_method ,sum(s.total) as total,count(s.id) as quantity_items,t.status,u.store as seller,t.seller_id, t.created_at ,t.updated_at from transaction t left join sales s on s.transaction_id = t.id inner join shipping s2 on t.shipping_id = s2.id inner join payment p on t.payment_id = p.id inner join users u on u.id = t.seller_id Where t.user_id = $1 " +
            textQuery +
            " t.deleted_at group by t.id,s2.id,p.id,u.id" +
            querySort +
            paginationSql,
          queryKey.length !== 0 ? queryKey : ""
        )
          .then((result) => {
            const totalData = countData.rowCount;
            const totalPage = Math.ceil(totalData / parseInt(limit));

            const data = {
              data: result.rows,
              totalData: totalData,
              totalPage: totalPage,
              query: queryList,
            };
            resolve(data);
          })
          .catch((err) => {
            reject(err);
          });
      })
      .catch((err) => {
        reject(err);
      });
  });
};
const getAllTransactionsSeller = (id) => {
  return new Promise((resolve, reject) => {
    db.query(
      "select t.id ,s2.method as shipping_method,p.method as payment_method ,sum(s.total) as total,count(s.id) as quantity_items,t.status,u.username as coustomer,t.user_id as coustomer_id, t.created_at ,t.updated_at from transaction t left join sales s on s.transaction_id = t.id inner join shipping s2 on t.shipping_id = s2.id inner join payment p on t.payment_id = p.id inner join users u on u.id = t.user_id Where t.seller_id = $1 group by t.id,s2.id,p.id,u.id",
      [id]
    )
      .then((result) => {
        resolve(result.rows);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const getDetailTransactions = (id) => {
  return new Promise((resolve, reject) => {
    const sqlQuery =
      'select t.id ,s2."method" as "shipping_method",p."method" as "payment_method" ,sum(s.total) as total,count(s.id) as quantity_items,u.store as seller,t.seller_id,u2.username as coustomer,t.user_id as coustomer_id,t.status, t.created_at ,t.updated_at from "transaction" t left join sales s on s.transaction_id = t.id inner join shipping s2 on t.shipping_id = s2.id inner join payment p on t.payment_id = p.id inner join users u on u.id = t.seller_id inner join users u2 on u2.id = t.user_id where t.id = $1 group by t.id,s2.id,p.id,u.id,u2.id ';
    db.query(sqlQuery, [id])
      .then((result) => {
        resolve(result.rows);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const getSalesByTransactionid = (id) => {
  return new Promise((resolve, reject) => {
    db.query(
      'select s.id,p."name" ,p.description ,s2.price ,s.quantity ,s.total from sales s inner join "stock" s2 on s.stock_id = s2.id inner join product p on s2.product_id = p.id where s.transaction_id = $1',
      [id]
    )
      .then((result) => {
        resolve(result.rows[0]);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const softDeleteTransaction = (id) => {
  return new Promise((resolve, reject) => {
    const deleted_at = new Date(Date.now());
    db.query("update transaction set deleted_at = $1 where id = $2", [
      deleted_at,
      id,
    ])
      .then((result) => {
        resolve(result.rows[0]);
      })
      .catch((err) => {
        reject(err);
      });
  });
};
const updateUnitStock = async (quantity, id) => {
  try {
    const checkStock = await db.query(
      "select unit_stock from stock where id = $1",
      [id]
    );
    if (!checkStock.rows) {
      throw new Error("Stock Not Found");
    }
    // cek stock
    if (checkStock.rows[0].unit_stock === 0) {
      throw new Error("out of stock");
    }
    // cek kecukupan stock
    const stockCek = rows[0].unit_stock - parseInt(quantity);
    if (stockCek < 0) {
      throw new Error("not enough stock");
    }
    const query =
      "update stock set unit_stock = unit_stock - $1 where id = $2 ";
    await db.query(query, [quantity, id]);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createSales,
  createTransactions,
  getAllTransactionsSeller,
  getAllTransactionsUser,
  getAllTransaction,
  getDetailTransactions,
  getSalesByTransactionid,
  softDeleteTransaction,
  updateUnitStock,
};
