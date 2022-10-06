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
const { populate } = require("../models/rolesModel");

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

    // const folderID = req.body.folderID;
    const folderID = req.params.id;
    const {
      enactNum,
      enactAddress,
      releaseDate,
      description,
      userCreate,
      status,
    } = req.body;

    if (fileList.length === 1) {
      fileList.map(async (file, index) => {
        const ids = new ObjectId();
        const newImage = new proofFile({
          _id: ids,
          name: Buffer.from(file.originalname, "latin1").toString("utf8"),
          data: fs.readFileSync(file.path),
          mimeType: file.mimetype,
          size: file.size,
          proofFolder: folderID,
          enactNum: enactNum,
          enactAddress: enactAddress,
          releaseDate: moment(releaseDate, "DD-MM-YYYY"),
          description: description,
          status: status,
          userCreate: userCreate,
        });
        try {
          //listing messages in users mailbox
          await proofFolder
            .findByIdAndUpdate(folderID, {
              $push: { proofFiles: ids },
            })
            .exec();

          newImage.save();
          return res.status(200).json({
            success: true,
            message: "Tải tệp lên thành công",
            fileList,
          });
        } catch (err) {
          next(err);
          return res.status(400).json({
            success: true,
            message: "Tải tệp lên thất bại",
            fileList,
          });
        }
      });
    } else {
      try {
        fileList.map(async (file, index) => {
          const ids = new ObjectId();
          const newImage = new proofFile({
            _id: ids,
            name: Buffer.from(file.originalname, "latin1").toString("utf8"),
            data: fs.readFileSync(file.path),
            mimeType: file.mimetype,
            size: file.size,
            proofFolder: folderID,
            enactNum: enactNum && enactNum[0],
            enactAddress: enactAddress[0],
            releaseDate: moment(releaseDate[0], "DD-MM-YYYY"),
            description: description[0],
            status: status[0],
            userCreate: userCreate[0],
          });
          // push to proofFolder
          // try {
          //listing messages in users mailbox
          await proofFolder
            .findByIdAndUpdate(folderID, {
              $push: { proofFiles: ids },
            })
            .exec();

          newImage.save();
        });
        return res.status(200).json({
          success: true,
          message: "Tải tệp lên thành công",
          fileList,
        });
      } catch (error) {
        next(err);
        return res.status(400).json({
          success: false,
          message: "Tải tệp lên thất bại",
          fileList,
        });
      }
    }
  });
};

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

  //------
};

exports.getFileFromFolder = async (req, res, next) => {
  const storage = await proofFolder
    .find({ _id: req.params.id })
    .select("proofFiles")
    .populate({
      path: 'proofFiles',
      model: 'proof_file',
      select: {
        'data': 0
      },
      populate: {
        path: 'proofFolder',
        model: 'proof_folder',
        select: {
          'title': 1
        }
      }   
      
      
    });
    

  if (!storage) {
    return next(new Error("404 not found"));
  }
  res.send(storage);
};

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

exports.getDataFromFile = async (req, res, next) => {
  const file = await proofFile.findById(req.params.id).select("data name");
  const data = file.data;
  if (!file) {
    next(new Error("Data not found!!!"));
  }
  res.status(200).json({
    success: true,
    data,
    file,
  });
};

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

exports.getAllDocumentByRole = async (req, res) => {
  const user = await User.findById(req.params.id);
  const role = await Role.findById(user.roleID);
  const arr = [];
  const child = await proofFolder
    .aggregate([
      { $match: { _id: { $in: user.proofStore } } },
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
        $unwind: "$children",
      },
    ])
    .exec();

  child.map((result) => {
    arr.push(result.children._id);
  });
  user.proofStore.map((result) => {
    arr.push(result);
  });


  if (role.roleID === "ADMIN") {
    return proofFile
      .find({}, (err, result) => {
        if (err) {
          console.log(err);
        }
        return res.send(result);
      })
      .populate("proofFolder", "title")
      .populate([
        {
          path: "userCreate",
          model: "user",
          select: {
            fullName: 1,
            _id: 0,
          },
        },
      ])
      .select("-data")
      .clone();
  }

  proofFile
    .aggregate()
    .match({
      $and: [{ proofFolder: { $in: arr } }],
    })
    .project({
      data: 0,
    })

    .exec(function (err, result) {
      if (err) {
        return console.log(err);
      } else {
        proofFile.populate(
          result,
          [
            {
              path: "userCreate",
              select: { fullName: 1, _id: 0 },
              model: "user",
            },
            {
              path: "proofFolder",
              select: { title: 1, _id: 0 },
              model: "proof_folder",
            },
          ],

          (err, list) => {
            res.send(list);
          }
        );
      }
    });
};

exports.changeFileLocation = async (req, res) => {
  const { fileID, location } = req.body;

  const folderID = await proofFolder.find({ proofFiles: fileID });
  if (folderID) {
    //Remove
    folderID.map((result) => {
      proofFolder
        .updateOne(
          { _id: { $in: result._id } },
          {
            $pull: {
              proofFiles: fileID,
            },
          }
        )
        .exec();
    });
    //Replace
    proofFolder
      .updateOne(
        {
          _id: location,
        },
        {
          $push: {
            proofFiles: fileID,
          },
        }
      )
      .exec();
    //update proofFolder
    proofFile
      .updateOne(
        {
          _id: fileID,
        },
        {
          $set: {
            proofFolder: location,
          },
        }
      )
      .exec();
    return res.send("File moved successfully");
  }
  res.status(400).json({
    success: false,
    message: "Something went wrong",
  });
};

exports.modifyProofData = async (req, res) => {
  const { fileName, enactNum, address, date, desc, folderID } = req.body;

  await proofFolder
    .updateOne(
      { proofFiles: req.params.id },
      {
        $pull: {
          proofFiles: req.params.id,
        },
      }
    )
    .exec();

  await proofFolder
    .updateOne(
      {
        _id: ObjectId(folderID),
      },
      {
        $push: {
          proofFiles: req.params.id,
        },
      }
    )
    .exec();

  await proofFile
    .updateOne(
      {
        _id: req.params.id,
      },
      {
        $set: {
          name: fileName,
          enactNum: enactNum,
          enactAddress: address,
          releaseDate: moment(date, "DD-MM-YYYY"),
          description: desc,
          proofFolder: folderID,
        },
      }
    )
    .exec((err, result) => {
      if (err) {
        console.log(err);
      }
      res.send("Update folder successfully");
    });
};

exports.searchProof = async (req, res) => {
  const user = User.find({ _id : req.params._id }).populate()
  const result = await proofFile
    .find({
      $and: [
        { name: { $regex: req.body.key, $options: "i" } },
        { proofFolder: req.params.id },
      ],
    })
    .collation({ locale: "en_US", strength: 1 })
    .select("-data");
  if (result) {
    res.status(200).json({
      success: true,
      result,
    });
  } else {
    res.status(404).json({
      message: "Not found anything else",
    });
  }
};
