const productModels = require("../models/product");

const {
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
  updateFile,
  getSingelFile,
} = productModels;

const createProductsControllers = async (req, res) => {
  try {
    const { id } = req.userPayload;
    const result = await createProducts(req.body, id);
    await createStock(req.body, result);
    const { files = null } = req;
    const waitingFile = new Promise((resolve, reject) => {
      let count = 0;
      req.files.map(async (file) => {
        try {
          await createFile(file, result);
          count += 1;
          if (count === files.length) {
            return resolve();
          }
        } catch (error) {
          reject(error);
        }
      });
    });
    await waitingFile;
    return res.status(200).json({
      msg: "Created product successfull",
      data: {
        result,
      },
    });
  } catch (error) {
    res.status(500).json({
      error,
      data: [],
    });
  }
};

const getSingleProductsControllers = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getSingleProducts(id);
    if (!result.data) {
      return res.status(404).json({
        msg: "Product Not Found",
      });
    }
    res.status(200).json({
      data: result.data,
      pict: result.file,
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getAllProductControllers = async (req, res) => {
  try {
    // cek query page
    req.query.page =
      req.query.page === undefined
        ? 1
        : req.query.page === ""
        ? 1
        : req.query.page;

    const products = await getAllProduct(req.query);

    if (products.data.length === 0) {
      return res.status(404).json({
        msg: "Product Not Found",
      });
    }
    const waitFile = new Promise((resolve, reject) => {
      let countFile = 0;
      let productsFix = [];
      products.data.map(async (data) => {
        try {
          const file = await getSingelFile(data.product_id);
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
    const productsFix = await waitFile;

    //  path
    let queryPath = "";
    products.query.map((item) => {
      queryPath += `${item.query}=${item.value}&`;
    });
    const nextPage = parseInt(req.query.page) + 1;
    const prevPage = parseInt(req.query.page) - 1;

    let next =
      nextPage > products.totalPage
        ? {}
        : { next: `/product?${queryPath}page=${nextPage}` };
    let prev =
      req.query.page <= 1
        ? {}
        : { prev: `/product?${queryPath}page=${prevPage}` };

    //   meta
    const meta = {
      totalData: products.totalData,
      totalPage: products.totalPage,
      page: req.query.page,
      ...next,
      ...prev,
    };

    res.status(200).json({
      data: productsFix,
      meta,
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getAllFavoriteControllers = async (req, res) => {
  try {
    const products = await getAllFavorite();
    if (products.data.length === 0) {
      return res.status(404).json({
        msg: "Product Not Found",
      });
    }
    const waitFile = new Promise((resolve, reject) => {
      let countFile = 0;
      let productsFix = [];
      products.data.map(async (data) => {
        try {
          const file = await getSingelFile(data.product_id);
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
    const productsFix = await waitFile;
    res.status(200).json({
      data: productsFix,
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const updateProductControllers = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await updateProduct(id, req.body);
    const resultSize = await updateSize(req.body);
    // handler files
    const { files = null } = req;
    const arrFilesKey = req.body.files_id;
    if (files !== null) {
      const waitingFile = new Promise((resolve, reject) => {
        let count = 0;
        req.files.map(async (file) => {
          try {
            await updateFile(file, arrFilesKey);
            count += 1;
            if (count === files.length) {
              return resolve();
            }
          } catch (error) {
            reject(error);
          }
        });
      });
      await waitingFile;
    }

    res.status(200).json({
      data: {
        result,
        resultSize,
      },
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};
const getAllBrand = async (req, res) => {
  try {
    const result = await getAllBrands();
    res.status(200).json({
      data: result,
    });
  } catch (error) {
    console.log(err);
    res.status(400).json({
      error,
    });
  }
};
const getAllCategory = async (req, res) => {
  try {
    const result = await getAllCategories();
    res.status(200).json({
      data: result,
    });
  } catch (error) {
    console.log(err);
    res.status(400).json({
      error,
    });
  }
};
const getAllColor = async (req, res) => {
  try {
    const result = await getAllColors();
    res.status(200).json({
      data: result,
    });
  } catch (error) {
    console.log(err);
    res.status(400).json({
      error,
    });
  }
};
const getAllSize = async (req, res) => {
  try {
    const result = await getAllSizes();
    res.status(200).json({
      data: result,
    });
  } catch (error) {
    console.log(err);
    res.status(400).json({
      error,
    });
  }
};
module.exports = {
  createProductsControllers,
  getSingleProductsControllers,
  getAllProductControllers,
  getAllFavoriteControllers,
  updateProductControllers,
  getAllBrand,
  getAllCategory,
  getAllColor,
  getAllSize,
};
