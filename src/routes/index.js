const Router = require('express').Router();


const pingRouter = require("./ping");
const usersRoutes = require("./users");
const authRouter = require("./auth");
const transactionRouter = require("./transactions");
const productRouter = require("./product");
const brandRouter = require("./brands");
const categoryRouter = require("./category");
const colorRouter = require("./colors");
const sizeRouter = require("./sizes");

Router.use("/ping", pingRouter);
Router.use("/users", usersRoutes);
Router.use("/auth", authRouter);
Router.use("/product", productRouter);
Router.use("/transaction", transactionRouter);
Router.use("/brands", brandRouter);
Router.use("/categories", categoryRouter);
Router.use("/colors", colorRouter);
Router.use("/sizes", sizeRouter);
module.exports = Router;
