require("dotenv").config();

const express = require("express");
const mainRoter = require("./src/routes");
const db = require("./src/config/db");
const cloudConfig = require("./src/config/cloudinary");
const cors = require("cors");
const morgan = require("morgan");

const server = express();
const PORT = process.env.PORT || 8080;

db.connect()
  .then(() => {
    server.use(express.json());
    server.use(express.urlencoded({ extended: false }));
    console.log("Database Connected");
    // pasang cors
    const corsOptions = {
      origin: ["http://localhost:3000"],
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    };

    server.use(cors(corsOptions));

    server.use(express.urlencoded({ extended: false }));
    server.use(express.json());

    server.use(cloudConfig);

    if (process.env.STATUS === "development") {
      server.use(morgan("default"));
    }

    server.use(mainRoter);

    server.listen(PORT, () => {
      console.log(`App listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
