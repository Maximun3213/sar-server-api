const { proofFile, proofFolder } = require("../models/proofsModel");
const User = require("../models/usersModel");
const Role = require("../models/rolesModel");
const mongoose = require("mongoose");
const json = require("body-parser");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const moment = require("moment");
const { ObjectId } = require("mongodb");
// const { title } = require("process");

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

//----hàm upload file

exports.uploadFile = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      return res
        .status(400)
        .send({ success: false, message: "Tối đa 4 tệp được upload" });
    }

    const fileList = req.files;

    // const folderID = req.body.folderID;
    const folderID = req.params.id;
    const { enactNum, enactAddress, releaseDate, description } = req.body;

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
          enactNum: enactNum,
          enactAddress: enactAddress,
          releaseDate: moment(releaseDate, "DD-MM-YYYY"),
          description: description,
        });
        // push to proofFolder
        proofFolder
          .findByIdAndUpdate(folderID, {
            $push: { proofFiles: ids },
          })
          .exec();

        newImage.save();
      });

    res.status(200).json({
      success: true,
      message: "Tải tệp lên thành công",
      fileList,
    });
  });
};

//----Tạo folder

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

//----Xuất all files

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

//----Lấy file trong folder

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

//----Xóa thư mục

exports.removeDirectory = async (req, res, next) => {
  //----
  try {
    const fileList = await proofFolder.findById(req.params.id);

    //---Delete all files at root
    await proofFile.deleteMany({ _id: fileList.proofFiles }).exec();

    //---Delete all file and folders inside root
    await proofFolder
      .aggregate([
        { $match: { _id: fileList._id } },
        {
          $graphLookup: {
            from: "proof_folders",
            startWith: "$_id",
            connectFromField: "_id",
            connectToField: "parentID",
            as: "children",
            maxDepth: 4,
            depthField: "level",
            restrictSearchWithMatch: {},
          },
        },
        {
          $project: {
            _id: 1,
            title: 1,
            proofFiles: 1,
            "children._id": 1,
            "children.title": 1,
            "children.proofFiles": 1,
          },
        },
      ])
      .then((data) => {
        data.forEach((child) => {
          child.children.forEach((childList) => {
            proofFolder.deleteOne({ _id: childList._id }).exec();
            proofFile.deleteMany({ _id: childList.proofFiles }).exec();
          });
        });
      });
    //---Delete root
    await proofFolder.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: "Folder removed successfully",
    });
  } catch (error) {
    // This is where you handle the error
    res.status(500).send(error);
  }
};

//----Xóa file

exports.postDeleteFile = async (req, res, next) => {
  try {
    const getFolderId = await proofFile
      .findById(req.params.id)
      .select("proofFolder");
    await proofFolder.updateMany(
      { _id: getFolderId.proofFolder },
      {
        $pull: {
          proofFiles: req.params.id,
        },
      }
    );

    await proofFile.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: "Delete success",
    });
  } catch (error) {
    // This is where you handle the error
    res.status(500).send(error);
  }
};

//----Lấy data từ file

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

//----Cập nhật folder

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

//----
// exports.getProofFolderById = async (req, res, next) => {
//   const file = await Proof.findOne({ _id: req.params.id });
//   if (!file) {
//     next(new Error("Folder not found!!!"));
//   }
//   res.status(200).json({
//     success: true,
//     file,
//   });
// };

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

//Lấy tài liệu minh chứng theo từng người dùng
exports.getAllDocumentByRole = async (req, res) => {
  const user = await User.findById(req.params.id);
  const role = await Role.findById(user.roleID);
  const proofStore = user.proofStore;
  if (role.roleID === "ADMIN") {
    return proofFile
      .find({}, (err, result) => {
        if (err) {
          console.log(err);
        }
        return res.send(result);
      })
      .populate("proofFolder", "title")
      .select("-data")
      .clone();
  }
  await proofFile
    .aggregate()
    .match({ proofFolder: { $in: proofStore } })
    .project({
      data: 0,
    })
    .exec(function (err, result) {
      if (err) {
        return console.log(err);
      } else {
        proofFile.populate(
          result,
          { path: "proofFolder", select: { title: 1, _id: 0 } },
          (err, list) => {
            res.send(list);
          }
        );
      }
    });
};
