const { proofFile, proofFolder } = require("../models/proofsModel");
const mongoose = require("mongoose");
const json = require("body-parser");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const { ObjectId } = require("mongodb");
const { title } = require("process");

const Str = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + file.originalname.match(/\..*$/)[0]
    );
  },
});

//Hoàn thành
const upload = multer({
  storage: Str,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
}).any("uploadedFiles", 4);

exports.uploadFile = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      return res
        .status(400)
        .send({ success: false, message: "Tối đa 4 tệp được upload" });
    }

    const fileList = req.files;

    const folderID = req.body.folderID;

    fileList[0] &&
      fileList.map((file, index) => {
        const ids = new ObjectId();
        const newImage = new proofFile({
          _id: ids,
          name: file.originalname,
          data: fs.readFileSync(file.path),
          mimeType: file.mimetype,
          size: file.size,
          proofFolder: folderID,
        });
        // push to proofFolder
        proofFolder
          .findByIdAndUpdate(folderID, {
            $push: { proofFiles: ids },
          })
          .exec(function (err, data) {
            if (err) {
              console.log(err);
            }
            console.log(data);
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

//Hoàn thành
exports.createFolder = async (req, res, next) => {
  const { title, parentID } = req.body;

  if (title === "") {
    res.send("Name must be provided");
  } else {
    const dir = await proofFolder.create({ title, parentID });
    res.status(201).json({
      success: true,
      message: "New folder was created",
    });
  }
};

//Hoàn thành
exports.getFileList = async (req, res) => {
  await proofFolder
    .find({}, (err, items) => {
      if (err) {
        console.log(err);
        res.status(500).send("An error occurred", err);
      } else {
        res.send(items);
      }
    })
    .clone()
    .catch(function (err) {
      console.log(err);
    });
};

//In danh sách file
// exports.getFileList = async (req, res) => {
//   await Proof.find({}, (err, items) => {
//     if (err) {
//       console.log(err);
//       res.status(500).send("An error occurred", err);
//     } else {
//       res.send(items);
//     }
//   })
//     .select("name mimeType size parentID")
//     .clone()
//     .catch(function (err) {
//       console.log(err);
//     });
// };

// Hoàn thành
exports.getFileFromFolder = async (req, res, next) => {
  const storage = await proofFolder
    .find({ _id: req.params.id })
    .select("proofFiles")
    .populate("proofFiles", "name mimeType size");

  if (!storage) {
    return next(new Error("404 not found"));
  }
  res.send(storage);
};
//Xóa thư mục
exports.removeDirectory = async (req, res, next) => {
  //----
  const key = req.params.id;
  const files = await proofFolder
    .find({_id: key}, (err, file) => {
      if (err) {
        console.log(err);
        res.status(500).send("An error occurred", err);
      } else {
        return file
      }
    }).clone().select("proofFiles")
    
    
  files.map(file => {
    console.log(file.proofFiles)
    console.log(file.proofFiles[0]._id)
    proofFolder
    .deleteMany({ proofFiles: file.proofFiles[0]._id }, function (err) {
      console.log(err)
    })
    .clone();

    res.status(200).json({
      success: true,
      message: "Delete folder successfully",
    });
  })
  
};

//Cần sửa lại
exports.postDeleteFile = async (req, res, next) => {
  const file = await proofFile.findById({ _id: req.params.id });

  if (!file) {
    return next(new Error("404 not found"));
  }
  await proofFile.deleteOne(file);
  res.status(200).json({
    success: true,
    message: "Delete success",
  });
};

//Hoàn thành
exports.getDataFromFile = async (req, res, next) => {
  const file = await proofFile.findById(req.params.id).select("data");
  const data = file.data;
  if (!file) {
    next(new Error("Data not found!!!"));
  }
  res.status(200).json({
    success: true,
    data,
  });
};

exports.getProofFolderById = async (req, res, next) => {
  const file = await Proof.findOne({ _id: req.params.id });
  if (!file) {
    next(new Error("Folder not found!!!"));
  }
  res.status(200).json({
    success: true,
    file,
  });
};

//Hoàn thành
exports.updateFolder = async (req, res, next) => {
  const { title, parentID } = req.body;

  if (title === "") {
    res.send("Name must be provided");
  } else {
    var myquery = { _id: req.params.id };
    var newvalues = { $set: { title: title, parentID: parentID } };
    await proofFolder.updateOne(myquery, newvalues, { upsert: true });
    res.status(200).json({
      success: true,
      message: "Update success",
    });
  }
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
