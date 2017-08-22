const config = require('config');
const database = require('./database');
const express = require('express');

const router = express.Router();
router.get('/', (req, res) => {
  const space = req.query.space;
  const newer = req.query.newer;
  database.find(space, newer ? parseInt(newer) : 0).then(records => {
    res.contentType('json');
    res.send(records);
  }).catch(error => {
    throw error;
  });
});

module.exports = router;
