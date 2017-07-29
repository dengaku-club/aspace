const express = require('express');

const app = express();
const post = require('./post');
const get = require('./get');

app.use('/', post);
app.use('/', get);

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});

app.use('/samples', express.static(`${__dirname}/../samples`));
