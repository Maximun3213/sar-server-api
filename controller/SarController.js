const { SarFile, SarProofFolder } = require("../models/sarModel");
const Role = require("../models/rolesModel");
const Notification = require("../models/notificationModel");
const { setNotification } = require("../middleware/notification");
const {
  TableOfContent,
  Part,
  Chapter,
  Criteria,
} = require("../models/tableContentModel");
const json = require("body-parser");
const { ObjectId } = require("mongodb");
const { aggregate } = require("../models/rolesModel");
const User = require("../models/usersModel");

exports.createSar = async (req, res, next) => {
  const ids = new ObjectId();
  const treeId = new ObjectId();
  const titleArr = [];
  const partID = [];
  const chapterID = [];
  const chapterLength = [];
  const tree = await TableOfContent.findOne();
  if (treeRoot) {
    const parts = await Part.find({ _id: { $in: treeRoot.partID } });

    parts.map((part) => {
      chapterLength.push(part.chapterID.length);
    });
    //save chapter

    const chapterList = [];
    const chapterTitle = [];
    parts.map((part) => {
      part.chapterID.map((chapter) => {
        chapterList.push(chapter);
      });
    });

    const chapter = await Chapter.find({ _id: { $in: chapterList } });
    chapter.forEach((element) => {
      chapterTitle.push(element.title);
    });

    chapterTitle.map((result, key) => {
      const ids = new ObjectId();
      const newPart = new Chapter({
        _id: ids,
        title: result,
        order: key,
      });
      chapterID.push(ids);
      newPart.save();
    });
    //save part

    parts.forEach((element) => {
      titleArr.push(element.title);
    });

    let start = 0;

    titleArr.map((result, key) => {
      const ids = new ObjectId();

      if (start <= chapterID.length) {
        // console.log("start", start);

        const newPart = new Part({
          _id: ids,
          title: result,
          chapterID: chapterID.slice(start, chapterLength[key] + start),
          order: key,
        });
        partID.push(ids);
        newPart.save();

        start = start + chapterLength[key];
      }
    });
  }

  const {
    title,
    desc,
    lang,
    structure,
    proofStore,
    category,
    root,
    license,
    curriculum,
    status,
  } = req.body;

  const newSarFile = new SarFile({
    _id: ids,
    title: title,
    desc: desc,
    lang: lang,
    structure: structure,
    proofStore: proofStore,
    category: category,
    root: root,
    license: license,
    curriculum: curriculum,
    status: status,
  });
  newSarFile.save((err) => {
    if (err) {
      return next(err);
    }

    const newTreeStructure = new TableOfContent({
      _id: treeId,
      sarID: ids,
      partID: partID,
    });

    newTreeStructure.save((err) => {
      if (err) {
        return next(err);
      }
      SarFile.updateOne({ _id: ids }, { $set: { indexID: treeId } }).exec();
    });

    res.status(200).json({
      success: true,
      message: "Tạo quyển Sar thành công",
    });
  });
};

exports.createSarFolder = async (req, res) => {
  const { title, parentID, docs } = req.body;

  await SarProofFolder.create(req.body);
  res.status(200).json({
    success: true,
    message: "New folder is created",
  });
};

exports.getAllSarFiles = async (req, res, next) => {
  await SarFile.find({}, (err, result) => {
    if (err) {
      return next(err);
    }
    res.send(result);
  }).clone();
};

exports.removeSarFile = async (req, res, next) => {
  try {
    await TableOfContent.findOne({ sarID: ObjectId(req.params.id) }).exec(
      (err, result) => {
        if (err) {
          return next(err);
        }
        Part.find({ _id: result.partID }, (err, result) => {
          result.map((chapter) => {
            Chapter.deleteMany({ _id: chapter.chapterID }).exec();
            Criteria.deleteMany({ _id: chapter.criteriaID}).exec()
          });
        });

        Part.deleteMany({ _id: result.partID }).exec();
      }
    );

    await TableOfContent.deleteOne({ sarID: req.params.id })
      .clone()
      .exec((err) => {
        if (err) {
          console.log(err);
        }

        SarFile.findOneAndDelete({ _id: req.params.id }).exec((err, result) => {
          if (err) console.log(err);
          User.updateMany(
            { _id: result.user_access && result.user_manage },
            {
              $set: {
                roleID: null,
              },
            }
          );
          res.send("Xóa quyển Sar thành công");
        });
      });
  } catch (error) {
    return next(error);
  }
};

exports.modifySarData = async (req, res) => {
  const {
    title,
    desc,
    lang,
    structure,
    proofStore,
    category,
    root,
    license,
    curriculum,
    status,
  } = req.body;
  await SarFile.updateOne(
    {
      _id: req.params.id,
    },
    {
      $set: {
        title: title,
        desc: desc,
        lang: lang,
        structure: structure,
        category: category,
        root: root,
        license: license,
        curriculum: curriculum,
        status: status,
        updateAt: Date.now(),
      },
    }
  ).exec((err, result) => {
    if (err) {
      console.log(err);
    }
    res.send("Update sar successfully");
  });
};

exports.getDataFromSarFile = async (req, res, next) => {
  const file = await SarFile.findById(req.params.id);
  if (!file) {
    next(new Error("Data not found!!!"));
  }
  res.send(file);
};

exports.addMemberToSar = async (req, res, next) => {
  const listOfUserID = req.body.userList;
  const roleUser = await Role.findOne({ roleID: "USER" });
  await SarFile.updateMany(
    { _id: req.body.sarID },
    {
      $push: {
        user_access: listOfUserID,
      },
    }
  ).exec((err, result) => {
    if (err) return res.send("Thêm thành viên thất bại");

    User.updateMany(
      { _id: listOfUserID },
      {
        $set: {
          roleID: roleUser._id,
        },
      }
    ).exec((err) => {
      if (err) return res.send("Thêm thành viên thất bại");

      res.send("Thêm thành viên thành công");
    });
  });
};

exports.deleteMemberOfSar = async (req, res, next) => {
  const userID = req.params.userID;
  await SarFile.updateMany(
    { _id: req.params.id },
    {
      $pull: {
        user_access: { $in: userID },
      },
    }
  ).exec((err) => {
    if (err) {
      return next(err);
    }
    User.updateMany(
      { _id: userID },
      {
        $set: {
          roleID: null,
        },
      }
    ).exec();
    res.send("Xoá thành công");
  });
};

exports.getAllUserFromSar = async (req, res, next) => {
  await SarFile.findOne({ _id: req.params.id }, (err, result) => {
    if (err) {
      return next(err);
    }
    if (result.user_access.length > 0) {
      User.find({ _id: result.user_access }).exec((err, result) => {
        if (err) {
          console.log(err);
        }
        res.send(result);
      });
    }
  }).clone();
};

exports.grantWritingRole = async (req, res, next) => {
  const roleCS = await Role.findOne({ roleID: "CS" });
  const { criteriaID, chapterID, userID, idSender, idSar, createAt } = req.body;
  const sar = await SarFile.findOne({ _id: idSar });

  if (criteriaID) {
    return Criteria.findOneAndUpdate(
      { _id: criteriaID },
      { $set: { user_access: userID } },
      (err, result) => {
        const content = `Người quản trị Sar đã thêm bạn vào tiêu chí "${result.title}" của quyển Sar "${sar.title}"`;
        if (err) return res.send(err);
        User.updateMany(
          { _id: userID },
          {
            $set: {
              roleID: roleCS._id,
            },
          }
        ).exec();
        setNotification(idSender, userID, createAt, content);

        res.send("Cấp quyền thành công");
      }
    ).clone();
  } else if (chapterID) {
    return Chapter.findOneAndUpdate(
      { _id: chapterID },
      {
        $set: {
          user_access: userID,
        },
      },
      (err, result) => {
        const content = `Người quản trị Sar đã thêm bạn vào chương "${result.title}" của quyển Sar "${sar.title}"`;

        if (err) return res.send(err);

        User.updateMany(
          { _id: userID },
          {
            $set: {
              roleID: roleCS._id,
            },
          }
        ).exec();
        setNotification(idSender, userID, createAt, content);

        res.send("Cấp quyền truy cập thành công");
      }
    ).clone();
  }
  res.send("Không thể cấp quyền");
};

exports.removeWritingRole = async (req, res, next) => {
  const { criteriaID, chapterID, userID, idSender, idSar, createAt } = req.body;
  const roleUser = await Role.findOne({ roleID: "USER" });
  const sar = await SarFile.findOne({ _id: idSar });

  if (criteriaID) {
    return Criteria.findOneAndUpdate(
      { _id: criteriaID },
      { $set: { user_access: null } },
      (err, result) => {
        if (err) return res.send(err);

        const content = `Người quản trị Sar đã xóa bạn khỏi tiêu chí "${result.title}" của quyển Sar "${sar.title}"`;

        User.updateMany(
          { _id: userID },
          {
            $set: {
              roleID: roleUser._id,
            },
          }
        ).exec((err) => {
          if (err) return res.send("Xóa thất bại");

          setNotification(idSender, userID, createAt, content);
        });

        res.send("Xóa thành công");
      }
    ).clone();
  } else if (chapterID) {
    return Chapter.findOneAndUpdate(
      { _id: chapterID },
      {
        $set: {
          user_access: null,
        },
      },
      (err, result) => {
        if (err) return res.send(err);

        const content = `Người quản trị Sar đã xóa bạn khỏi chương "${result.title}" của quyển Sar "${sar.title}"`;

        User.updateMany(
          { _id: userID },
          {
            $set: {
              roleID: roleUser._id,
            },
          }
        ).exec();
        setNotification(idSender, userID, createAt, content);

        res.send("Xóa thành công");
      }
    ).clone();
  }
  res.send("Xóa thất bại");
};
