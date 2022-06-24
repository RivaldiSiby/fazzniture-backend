const multer = require("multer");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "fazzniture",
  },
});

const limit = {
  fileSize: 2e6,
};

const imageOnlyFilter = (req, file, cb) => {
  const extName = path.extname(file.originalname);
  const allowedExt = /jpg|jpeg|png|JPG|JPEG|PNG/;
  if (!allowedExt.test(extName))
    return cb(new Error("File Extension JPG or PNG 2mb"), false);
  cb(null, true);
};

const imageUpload = multer({
  storage: cloudinaryStorage,
  limits: limit,
  fileFilter: imageOnlyFilter,
}).array("file", 4);

const upload = (req, res, next) => {
  imageUpload(req, res, (err) => {
    if (err) {
      res.status(400).json({
        error: err.message,
      });
      return;
    }
    next();
  });
};

module.exports = {
  upload,
};
