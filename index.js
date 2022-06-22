const express = require('express');

const mainRoter = require('./src/routes');

const server = express();
const PORT = 8080;

server.use(mainRoter);

server.listen(PORT, () => {
   console.log(`App listening on port ${PORT}`);
});
