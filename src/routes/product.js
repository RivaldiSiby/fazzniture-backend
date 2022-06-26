const Router = require("express").Router();
const productControllers = require("../controllers/product");
const { upload } = require("../middlewares/upload");
const middleware = require("../middlewares/auth");

Router.post(
  "/",
  middleware.verifyToken,
  upload,
  productControllers.createProductsControllers
);
Router.get("/fav", productControllers.getAllFavoriteControllers);
Router.get("/", productControllers.getAllProductControllers);
Router.get("/:id", productControllers.getSingleProductsControllers);
Router.patch("/:id", productControllers.updateProductControllers);

module.exports = Router;
