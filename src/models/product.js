const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

const createProducts = (body, seller_id) => {
  return new Promise((resolve, reject) => {
    const { name, description, brands_id, category_id, colors_id } = body;
    const id = uuidv4();
    const created_at = new Date(Date.now());
    const updated_at = created_at;
    const sqlQuery =
      "INSERT INTO product (id, name, description, brands_id, category_id,colors_id,seller_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7,$8,$9) returning id";
    db.query(sqlQuery, [
      id,
      name,
      description,
      brands_id,
      category_id,
      colors_id,
      seller_id,
      created_at,
      updated_at,
    ])
      .then((result) => {
        console.log(result.rows);
        const response = result.rows[0];
        resolve(response.id);
      })
      .catch((err) => {
        console.log(err);
        reject({ status: 500, err });
      });
  });
};

const createStock = (body, product_id) => {
  return new Promise((resolve, reject) => {
    const { size_id, price, unit_stock, condition } = body;
    const id = uuidv4();
    const created_at = new Date(Date.now());
    const updated_at = created_at;
    const sqlQuery =
      "INSERT INTO stock (id, size_id, price, product_id,unit_stock,condition, created_at, updated_at) values ($1, $2, $3, $4, $5, $6,$7,$8)";
    db.query(sqlQuery, [
      id,
      size_id,
      price,
      product_id,
      unit_stock,
      condition,
      created_at,
      updated_at,
    ])
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
    const sqlQuery =
      "INSERT into files (id, file, product_id, created_at, updated_at) values ($1, $2, $3, $4, $5)";
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
    const sqlQuery =
      ' select p.id,p."name",p.description,c."name" as category ,b."name" as brand,b.description as about_brand, c2."name" as color ,c2.class_color , s.id,s2.name as size,s.price,s.unit_stock, s.condition as stock_condition ,p.seller_id ,u.store as seller,u.store_description as seller_description,p.created_at ,p.updated_at from product p left join "stock" s on s.product_id = p.id inner join brands b on b.id = p.brands_id inner join category c on c.id = p.category_id inner join colors c2 on p.colors_id = c2.id inner join users u on p.seller_id = u.id inner join size s2 on s.size_id = s2.id where p.id = $1';
    const getFile = "SELECT id,file FROM files where product_id = $1";
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

const getAllProduct = async (query) => {
  try {
    // cek query
    const byCategory = Object.keys(query).find((item) => item === "category");
    const byBrand = Object.keys(query).find((item) => item === "brand");
    const byColor = Object.keys(query).find((item) => item === "color");
    const bySize = Object.keys(query).find((item) => item === "size");
    const byName = Object.keys(query).find((item) => item === "name");
    const bySort = Object.keys(query).find((item) => item === "sort");
    const byOrder = Object.keys(query).find((item) => item === "order");
    const byMin_range = Object.keys(query).find((item) => item === "min_range");
    const byMax_range = Object.keys(query).find((item) => item === "max_range");

    //  array query
    let queryArray = [];
    let querySort = "";
    let queryRange = "";
    let queryKey = [];
    let queryList = [];
    //  handler filter
    if (byCategory !== undefined) {
      queryArray.push("c.name");
      queryList.push({ query: "category", value: query.category });
      queryKey.push(query.category);
    }
    if (bySize !== undefined) {
      queryArray.push("s2.name");
      queryList.push({ query: "size", value: query.size });
      queryKey.push(query.size);
    }
    if (byBrand !== undefined) {
      queryArray.push("b.name");
      queryList.push({ query: "brand", value: query.brand });
      queryKey.push(query.brand);
    }
    if (byColor !== undefined) {
      queryArray.push("c2.name");
      queryList.push({ query: "color", value: query.color });
      queryKey.push(query.color);
    }
    if (byName !== undefined) {
      queryArray.push("p.name");
      queryList.push({ query: "name", value: query.name });
      queryKey.push(query.name);
    }

    //  loop pengecekan filter yang ada
    let countFilter = 0;
    let textQuery = "";
    queryArray.map((item) => {
      countFilter += 1;
      textQuery += `lower(${item}) LIKE lower('%' || $${countFilter} || '%') AND `;
    });

    //  handler range price
    if (byMin_range !== undefined) {
      queryList.push({ query: "min_range", value: query.min_range });
      if (query.min_range !== "") {
        queryKey.push(parseInt(query.min_range));
      }
      if (query.min_range === "") {
        queryKey.push(0);
      }

      queryRange += `s.price >= $${queryKey.length} and `;
    }
    if (byMax_range !== undefined && query.max_range !== "") {
      queryKey.push(parseInt(query.max_range));
      queryList.push({ query: "max_range", value: query.max_range });
      queryRange += `s.price <= $${queryKey.length} and `;
    }
    //  handler sort
    if (bySort !== undefined) {
      if (query.sort === "name") {
        querySort = "ORDER BY p.name ";
        querySort += byOrder === undefined ? "asc" : query.order;
      }

      if (query.sort === "price") {
        querySort = "ORDER BY s.price ";
        querySort += byOrder === undefined ? "asc" : query.order;
      }

      queryList.push({ query: "sort", value: query.sort });
    }

    const sqlQuery =
      "select  p.id,s.id as stock_id,p.name,p.description,c.name as category ,b.name as brand, s.id,s2.name as size,s.price,s.unit_stock, s.condition as stock_condition,c2.name as color ,c2.class_color  ,f.file,p.seller_id ,u.store as seller,p.created_at ,p.updated_at  from product p inner join stock s on s.product_id = p.id inner join brands b on b.id = p.brands_id inner join category c on c.id = p.category_id inner join files f on f.product_id = p.id inner join colors c2 on c2.id = p.colors_id inner join users u on p.seller_id = u.id inner join size s2 on s.size_id = s2.id ";
    const sqlCek = `WHERE ${textQuery + queryRange} p.deleted_at = 'false' `;

    // pagination
    const { page = 1, limit = 12 } = query;
    let limitValue = limit * 5;
    const offset = parseInt(page - 1) * parseInt(limit);
    const paginationSql = ` LIMIT $${queryKey.length + 1} OFFSET $${
      queryKey.length + 2
    }`;

    //  total data dan total page
    const queryCountData =
      "select s.id  from product p inner join stock s on s.product_id = p.id inner join brands b on b.id = p.brands_id inner join category c on c.id = p.category_id inner join colors c2 on c2.id = p.colors_id inner join users u on p.seller_id = u.id inner join size s2 on s.size_id = s2.id " +
      sqlCek +
      querySort;
    const countData = await db.query(
      queryCountData,
      queryKey.length !== 0 ? queryKey : ""
    );

    queryKey.push(limitValue);
    queryKey.push(offset);

    console.log("tes");
    const fixQuery = sqlQuery + sqlCek + querySort + paginationSql;
    const data = await db.query(
      fixQuery,
      queryKey.length !== 0 ? queryKey : ""
    );

    // atur meta
    const totalData = countData.rowCount;
    const totalPage = Math.ceil(totalData / parseInt(limitValue));

    return {
      data: data.rows,
      totalData: totalData,
      totalPage: totalPage,
      query: queryList,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getAllFavorite = async () => {
  try {
    const sqlQuery =
      'select p.id ,p."name" ,s.size_id ,s2."size" ,s2.price ,f.file ,count(quantity) as selling ,p.created_at ,p.updated_at  from sales s inner join "size" s2 on s2.id = s.size_id inner join product p on s2.product_id = p.id inner join files f on f.product_id = p.id group by s.size_id, s2.id, p.id, f.id';
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
    const sqlQuery =
      "UPDATE product SET name = coalesce(nullif($1, ''), name), description = coalesce(nullif($2, ''), description), updated_at = $3 where id = $4 returning *";
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
    const sqlQuery =
      "UPDATE size SET price = coalesce(nullif($1, '')::int, price), updated_at = $2 where id = $3 returning *";
    const data = await db.query(sqlQuery, [price, updated_at, size_id]);
    return data.rows;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getAllBrands = async () => {
  try {
    const result = await db.query("SELECT id, name from brands");
    return result.rows;
  } catch (error) {
    console.log(error);
  }
};

const getAllCategories = async () => {
  try {
    const result = await db.query("SELECT id, name from category");
    return result.rows;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
const getAllColors = async () => {
  try {
    const result = await db.query("SELECT id, name from colors");
    return result.rows;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getAllSizes = async () => {
  try {
    const result = await db.query("SELECT id, name from size");
    return result.rows;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
module.exports = {
  createProducts,
  createStock,
  createFile,
  getSingleProducts,
  getAllProduct,
  getAllFavorite,
  updateProduct,
  updateSize,
  getAllBrands,
  getAllCategories,
  getAllColors,
  getAllSizes,
};
