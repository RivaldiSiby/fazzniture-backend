require('dotenv').config();

const express = require('express');
const mainRoter = require('./src/routes');
const db = require('./src/config/db');
const cloudConfig = require('./src/config/cloudinary');

const server = express();
const PORT = process.env.PORT || 8080;

db.connect()
   .then(() => {
      server.use(express.json());
      server.use(express.urlencoded({ extended: false }));
      console.log('Database Connected');

      server.use(cloudConfig);

      server.use(mainRoter);

      server.listen(PORT, () => {
         console.log(`App listening on port ${PORT}`);
      });
   })
   .catch((error) => {
      console.log(error);
   });
