const {
  TableOfContent,
  Part,
  Chapter,
  Criteria,
} = require("../models/tableContentModel");

const json = require("body-parser");
const { ObjectId } = require("mongodb");
const { SarFile } = require("../models/sarModel");
const { proofFile } = require("../models/proofsModel");

exports.createTreeStructure = async (req, res) => {
  const { sarID, partID } = req.body;

  await TableOfContent.create(req.body);

  res.status(200).json({
    success: true,
    message: "Create a new structure successfully",
  });
};

exports.createCriteria = async (req, res) => {
  const { title, chapterID, index } = req.body;
  const ids = new ObjectId();

  const newCriteria = new Criteria({
    _id: ids,
    title: index + " " + title,
  });

  newCriteria.save((err) => {
    if (err) {
      console.log(err);
    }
    Chapter.updateOne(
      { _id: ObjectId(chapterID) },
      { $push: { criteriaID: ids } }
    ).exec();

    res.status(200).json({
      success: true,
      message: "Create a new criteria successfully",
    });
  });
};

exports.removeCriteria = async (req, res) => {
  try {
    await Chapter.updateOne(
      { criteriaID: req.params.id },
      {
        $pull: {
          criteriaID: req.params.id,
        },
      }
    ).exec((err) => {
      if (err) {
        console.log(err);
      }
      Criteria.deleteOne({ _id: req.params.id }).exec();

      res.status(200).json({
        success: true,
        message: "Xóa tiêu chí thành công",
      });
    });
  } catch (error) {
    res.send(error);
  }
};

exports.modifyCriteria = async (req, res) => {
  const { title, index } = req.body;
  await Criteria.updateOne(
    {
      _id: req.params.id,
    },
    {
      $set: {
        title: index + " " + title,
      },
    }
  ).exec((err, result) => {
    if (err) {
      console.log(err);
    }
    res.send("Update criteria successfully");
  });
};

exports.creatChapter = async (req, res) => {
  const { title, content, criteriaID, order } = req.body;

  await Chapter.create(req.body);

  res.status(200).json({
    success: true,
    message: "Create a new chapter successfully",
  });
};

exports.creatPart = async (req, res) => {
  const { title, chapterID, order } = req.body;

  await Part.create(req.body);

  res.status(200).json({
    success: true,
    message: "Create a new part successfully",
  });
};

exports.getTreeStructure = async (req, res, next) => {
  await TableOfContent.aggregate([
    {
      $match: {
        sarID: ObjectId(req.params.id),
      },
    },
    {
      $graphLookup: {
        from: "parts",
        startWith: "$partID",
        connectFromField: "partID",
        connectToField: "_id",
        as: "parts",
      },
    },

    { $unwind: "$parts" },

    {
      $graphLookup: {
        from: "chapters",
        startWith: "$parts.chapterID",
        connectFromField: "parts.chapterID",
        connectToField: "_id",
        as: "chapters",
      },
    },

    {
      $unwind: {
        path: "$chapters",
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $graphLookup: {
        from: "criterias",
        startWith: "$chapters.criteriaID",
        connectFromField: "chapters.criteriaID",
        connectToField: "_id",
        as: "criterias",
      },
    },
    {
      $unwind: {
        path: "$criterias",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        partID: 0,
      },
    },
    {
      $group: {
        _id: "$_id",
        sarID: { $first: "$sarID" },
        parts: { $addToSet: "$parts" },
        chapters: { $push: "$chapters" },
        criterias: { $push: "$criterias" },
      },
    },
  ]).exec((err, result) => {
    if (err) {
      return next(err);
    }
    res.send(result);
  });
};

exports.checkUserExist = async (req, res, next) => {
  const { idCriteria, idChapter, idUserLogin } = req.body;
  let content;
  if (idCriteria) {
    return Criteria.findOne({ _id: idCriteria }, (err, result) => {
      content = result.content;
      if (err) {
        return res.send({ isExist: false, content: content });
      }
      if (result !== null && result.user_access == idUserLogin) {
        return res.send({ isExist: true, content: content });
      }
      res.send({ isExist: false, content: content });
    }).clone();
  }
  if (idChapter) {
    return Chapter.findOne({ _id: idChapter }, (err, result) => {
      content = result.content;
      if (err) {
        return res.send({ isExist: false, content: content });
      }
      if (result !== null && result.user_access == idUserLogin) {
        return res.send({ isExist: true, content: content });
      }
      res.send({ isExist: false, content: content });
    }).clone();
  }
  res.send({ isExist: false });
};

exports.addNewContent = async (req, res) => {
  const { idCriteria, idChapter, content, deltaContent } = req.body;
  if (idCriteria) {
    return Criteria.updateOne(
      {
        _id: idCriteria,
      },
      {
        $set: {
          content: content,
          deltaContent: deltaContent,
        },
      }
    ).exec((err, result) => {
      if (err) console.log(err);

      res.send("Lưu tiêu chí thành công");
    });
  }
  await Chapter.updateOne(
    {
      _id: idChapter,
    },
    {
      $set: {
        content: content,
        deltaContent: deltaContent,
      },
    }
  ).exec((err, result) => {
    if (err) console.log(err);

    res.send("Lưu thành công");
  });
};
