const config = require('config');
const database = require('./database');
const express = require('express');
const multer  = require('multer');
const path = require("path");

const matchMimetype = mimetype => {
  return mimetype.match(/^image\/([A-Za-z]+)/);
};

const uploadAbsolutePath = path.resolve(config.uploads.directory);
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadAbsolutePath);
  },
  filename: (req, file, cb) => {
    const space = req.body.space;
    database.count(space).then(number => {
      const extension = matchMimetype(file.mimetype)[1];
      cb(null, `${space}_${number}.${extension}`);
    }).catch(error => {
      cb(error);
    });
  }
});

const fileFilter = (req, file, cb) => {
  const imageType = matchMimetype(file.mimetype);
  if (!imageType) {
    cb(new Error(`Invalid image type[${file.mimetype}]`));
    return;
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter });
const router = express.Router();
router.use(config.uploads.url_path, express.static(uploadAbsolutePath));

router.post('/', upload.single('image'), (req, res, next) => {
  const space = req.body.space;
  const record = Object.assign({}, req.body);
  delete record.space;
  for (let field in record) {
    if (!isNaN(record[field])) {
      record[field] = parseFloat(record[field]);
    }
  }
  record.image = `${config.uploads.url_path}/${req.file.filename}`;
  database.insert(space, record).then(record => {
    res.contentType('json');
    res.send(record);
  }).catch(error => {
    throw error;
  });
});

module.exports = router;
