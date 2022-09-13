const Image = require("../models/proofsModel");
const json = require("body-parser");
const fs = require("fs");
const multer = require("multer");
const path = require("path");

const Str = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + file.originalname.match(/\..*$/)[0]
    );
  },
});

const upload = multer({
  storage: Str,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  // fileFilter: (req, file, cb) => {
  //   if (
  //     file.mimetype == "image/png" ||
  //     file.mimetype == "image/jpg" ||
  //     file.mimetype == "image/jpge"
  //   ) {
  //     cb(null, false);
  //     const err = new Error("Only .doc, .pdf, .xls file format allowed");
  //     err.name = "ExtensionError";
  //     return cb(err);
  //   } else {
  //     cb(null, true);
  //   }
  // },
}).array("uploadedFiles", 4);

exports.uploadFile = async (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      return res
        .status(400)
        .send({ success: false, message: "Tối đa 4 tệp được upload" });
    }

    const fileList = req.files;

    fileList.map((file, index) => {
      const newImage = new Image({
        name: file.originalname,
        file: {
          data: fs.readFileSync(file.path),
          mimeType: file.mimetype,
          size: file.size,
        },
      });
      newImage.save();
    });
    res.status(200).json({
      success: true,
      message: "Upload file successfully",
      fileList,
    });
  });
};

//In danh sách file
exports.getFileList = (req, res) => {
  Image.find({}, (err, items) => {
    if (err) {
      console.log(err);
      res.status(500).send("An error occurred", err);
    } else {
      res.send(items);
    }
  });
};

//Search module
// exports.searchProof = async (req, res) => {
//   const file = await Image.find({
//     $or: [{ name: { $regex: req.params.key } }],
//   });
//   if (file) {
//     res.status(200).json({
//       success: true,
//       file,
//     });
//   } else {
//     res.status(404).json({
//       message: "Not found everything else",
//     });
//   }
// };
