const Proof = require("../models/proofsModel");
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
      const newImage = new Proof({
        name: file.originalname,
        data: fs.readFileSync(file.path),
        mimeType: file.mimetype,
        size: file.size,
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

exports.createFolder = async (req, res, next) => {
  const { name, parentID } = req.body;

  if (name === "") {
    res.send("Name must be provided");
  } else {
    const dir = await Proof.create({ name, parentID });

    res.status(201).json({
      success: true,
      message: "New folder was created",
    });
  }
};

//In danh sách file
exports.getFileList = (req, res) => {
  Proof.find({}, (err, items) => {
    if (err) {
      console.log(err);
      res.status(500).send("An error occurred", err);
    } else {
      res.send(items);
    }
  });
};

exports.getFileFromFolder = async (req, res, next) => {
  const storage = await Proof.find({ parentID: req.params.id}).select("name")

  if(!storage) {
    return next(new Error('404 not found'))
  }
  res.status(200).json({
    success: true,
    storage
  })
}

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
// const emptyFolder = async (folderPath) => {
//   try {
//       // Find all files in the folder
//       const files = await fsPromises.readdir(folderPath);
//       for (const file of files) {
//           await fsPromises.unlink(path.resolve(folderPath, file));
//           console.log(`${folderPath}/${file} has been removed successfully`);
//       }
//   } catch (err){
//       console.log(err);
//   }
// }

// emptyFolder('./files');
