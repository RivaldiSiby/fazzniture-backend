const {
  createSales,
  createTransactions,
  getAllTransaction,
  getDetailTransactions,
  getSalesByTransactionid,
  getAllTransactionsSeller,
  getAllTransactionsUser,
  softDeleteTransaction,
  updateUnitStock,
} = require("../models/transactions");

const { getSingelFile } = require("../models/product");

const createNewTransaction = async (req, res) => {
  try {
    const user_id = req.userPayload.id;
    const products = req.body.products;
    const waitingStock = new Promise((resolve, reject) => {
      let countData = 0;
      products.map(async (product) => {
        try {
          await updateUnitStock(product.quantity, product.stock_id);

          countData += 1;
          if (countData === products.length) {
            return resolve();
          }
        } catch (error) {
          console.log(error);
          reject(error);
        }
      });
    });
    await waitingStock;
    const result = await createTransactions(req.body, user_id);

    const waitingProduct = new Promise((resolve, reject) => {
      let countData = 0;
      products.map(async (product) => {
        try {
          await createSales(product, result);
          countData += 1;
          if (countData === products.length) {
            return resolve();
          }
        } catch (error) {
          console.log(error);
          reject(error);
        }
      });
    });
    await waitingProduct;
    res.status(201).json({
      msg: `Succes create transaction`,
      id: result,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      msg: error.message,
    });
  }
};

const showAllTransactions = async (req, res) => {
  try {
    req.query.page =
      req.query.page === undefined
        ? 1
        : req.query.page === ""
        ? 1
        : req.query.page;
    const user_id = req.userPayload.id;
    const role = req.userPayload.role;
    let result;
    if (role === "admin") {
      result = await getAllTransaction(req.query);
    }
    if (role === "seller") {
      const products = await getAllTransactionsSeller(req.query, user_id);
      console.log(products);
      const waitFile = new Promise((resolve, reject) => {
        let countFile = 0;
        let productsFix = [];
        products.data.map(async (data) => {
          try {
            const file = await getSingelFile(data.product_id);
            console.log(file);
            countFile += 1;
            data.file = file.file;
            productsFix.push(data);
            if (countFile === products.data.length) {
              return resolve(productsFix);
            }
          } catch (error) {
            reject(error);
          }
        });
      });
      // handler file

      products.data = await waitFile;
      result = products;
    }
    if (role === "coustomer") {
      result = await getAllTransactionsUser(req.query, user_id);
    }
    //  path
    let queryPath = "";
    result.query.map((item) => {
      queryPath += `${item.query}=${item.value}&`;
    });
    const nextPage = parseInt(req.query.page) + 1;
    const prevPage = parseInt(req.query.page) - 1;

    let next =
      nextPage > result.totalPage
        ? {}
        : { next: `/transaction?${queryPath}page=${nextPage}` };
    let prev =
      req.query.page <= 1
        ? {}
        : { prev: `/transaction?${queryPath}page=${prevPage}` };

    //   meta

    const meta = {
      totalData: result.totalData,
      totalPage: result.totalPage,
      page: req.query.page,
      ...next,
      ...prev,
    };
    res.status(200).json({
      msg: "Show all transaction",
      data: result.data,
      meta,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      msg: "Failed get all transaction",
      error,
    });
  }
};

const showDetailTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getDetailTransactions(id);
    const product = await getSalesByTransactionid(id);
    res.status(200).json({
      msg: "Show detail transaction",
      data: {
        result,
        product,
      },
    });
  } catch (error) {
    res.status(400).json({
      msg: "Cannot get detail transaction",
      error,
    });
    console.log(error);
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    await softDeleteTransaction(id);
    res.status(200).json({
      msg: "Succes delete transaction",
      data: { id },
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      msg: "cannot delete transaction",
      error,
    });
  }
};

module.exports = {
  createNewTransaction,
  showAllTransactions,
  showDetailTransaction,
  deleteTransaction,
};
