const productModels = require('../models/product');

const { createProducts, createSize, createFile, getSingleProducts, getAllProduct, getAllFavorite, updateProduct, updateSize } = productModels;

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
         msg: 'Created product successfull',
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
      const products = await getAllProduct();
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

module.exports = {
   createProductsControllers,
   getSingleProductsControllers,
   getAllProductControllers,
   getAllFavoriteControllers,
   updateProductControllers,
};
