const { proofFile, proofFolder } = require("../models/proofsModel");
const mongoose = require("mongoose");
const json = require("body-parser");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const { ObjectId } = require("mongodb");

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
}).any("uploadedFiles", 4);

exports.uploadFile = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      return res
        .status(400)
        .send({ success: false, message: "Tối đa 4 tệp được upload" });
    }

    const fileList = req.files;
    // const parentID = req.body.parentID.toString().slice(0, 24)
    fileList[0] &&
      fileList.map((file, index) => {
        const newImage = new proofFile({
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
  const title = req.body.title;
  const parentID = req.body.parentID;
  //check parentID exist
  const checkParentID = await proofFolder.findById(req.body.parentID);

  if (title === "") {
    res.send("Name must be provided");
  }

  else if (parentID) {
    const data = {
      _id : new mongoose.Types.ObjectId(),
      title : title,
      user_access : [],
      proofFiles : [],
      children : [],
    }
    const obj = []
    obj.push(data)

    const pipeline = [
      { $unwind: "$children" },
      { $match: { "children._id": ObjectId(parentID) } },
    ];

    await proofFolder.aggregate(pipeline).then(
      (res) => {
        console.log(res[0].children);
      },
      (err) => {
        console.log(err);
      }
    );

    // const element = await proofFolder.findByIdAndUpdate(filter, {
    //   $push: { children: obj },
    // });
    // return res.send(obj);
    return res.status(200).json({
      success: true,
    });
  }
  //Nếu không có parentID
  await proofFolder.create({ title });
  return res.send("Create a new folder successfully");
};

exports.getFileList = async (req, res) => {
  await proofFolder
    .find({}, (err, items) => {
      if (err) {
        console.log(err);
        res.status(500).send("An error occurred", err);
      }
      res.send(items);
    })
    .populate("children")
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

exports.getFileFromFolder = async (req, res, next) => {
  const storage = await Proof.find({ parentID: req.params.id });

  if (!storage) {
    return next(new Error("404 not found"));
  }
  res.status(200).json({
    success: true,
    storage,
  });
};

exports.postDeleteFile = async (req, res, next) => {
  const file = await Proof.findById({ _id: req.params.id });

  if (!file) {
    return next(new Error("404 not found"));
  }
  await Proof.deleteOne(file);
  res.status(200).json({
    success: true,
    message: "Delete success",
  });
};

exports.getDataFromFile = async (req, res, next) => {
  const file = await Proof.findById(req.params.id).select("data");
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

exports.updateFolder = async (req, res, next) => {
  const { name, parentID } = req.body;

  if (name === "") {
    res.send("Name must be provided");
  } else {
    var myquery = { _id: req.params.id };
    var newvalues = { $set: { name: name, parentID: parentID } };
    await Proof.updateOne(myquery, newvalues, { upsert: true });
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
