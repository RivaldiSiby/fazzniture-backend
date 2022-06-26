const productModels = require("../models/product");

const {
  createProducts,
  createSize,
  createFile,
  getSingleProducts,
  getAllProduct,
  getAllFavorite,
  updateProduct,
  updateSize,
  getAllBrands,
  getAllCategories,
  getAllColors,
  getAllSizes
} = productModels;

const createProductsControllers = async (req, res) => {
  try {
    const result = await createProducts(req.body);
    await createSize(req.body, result);
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
    req.query.page = req.query.page === undefined ? 1 : req.query.page;

    const products = await getAllProduct(req.query);
    let productsFix = [];
    products.data.map((data) => {
      if (productsFix.findIndex((item) => item.id === data.id) === -1) {
        productsFix.push(data);
      }
    });

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
    let productsFix = [];
    products.data.map((data) => {
      if (productsFix.findIndex((item) => item.id === data.id) === -1) {
        productsFix.push(data);
      }
    });
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
const getAllBrand =async(req, res)=>{
  try {
    const result = await getAllBrands()
    res.status(200).json({
      data : result
    })
  } catch (error) {
    console.log(err);
    res.status(400).json({
      error
    })
  }
}
const getAllCategory = async(req, res)=>{
  try {
    const result = await getAllCategories()
    res.status(200).json({
      data : result
    })
  } catch (error) {
    console.log(err);
    res.status(400).json({
      error
    })
  }
}
const getAllColor = async(req, res)=>{
  try {
    const result = await getAllColors()
    res.status(200).json({
      data : result
    })
  } catch (error) {
    console.log(err);
    res.status(400).json({
      error
    })
  }
}
const getAllSize = async(req, res)=>{
  try {
    const result = await getAllSizes()
    res.status(200).json({
      data : result
    })
  } catch (error) {
    console.log(err);
    res.status(400).json({
      error
    })
  }
}
module.exports = {
  createProductsControllers,
  getSingleProductsControllers,
  getAllProductControllers,
  getAllFavoriteControllers,
  updateProductControllers,
  getAllBrand,
  getAllCategory,
  getAllColor,
  getAllSize
};
