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

const emptyFolder = async (folderPath) => {
  try {
      // Find all files in the folder
      const files = await fsPromises.readdir(folderPath);
      for (const file of files) {
          await fsPromises.unlink(path.resolve(folderPath, file));
          console.log(`${folderPath}/${file} has been removed successfully`);
      }
  } catch (err){
      console.log(err);
  }
}

emptyFolder('./files');