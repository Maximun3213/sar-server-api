const {
  TableOfContent,
  Part,
  Chapter,
  Criteria,
} = require("../models/tableContentModel");

const json = require("body-parser");
const { ObjectId } = require("mongodb");
const { SarFile } = require("../models/sarModel");

exports.createTreeStructure = async (req, res) => {
  const { sarID, partID } = req.body;

  await TableOfContent.create(req.body);

  res.status(200).json({
    success: true,
    message: "Create a new structure successfully",
  });
};

exports.createCriteria = async (req, res) => {
  const { title, content, order } = req.body;

  await Criteria.create(req.body);

  res.status(200).json({
    success: true,
    message: "Create a new criteria successfully",
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
  const tree = await TableOfContent.findOne({ sarID: req.params.id }).select(
    "sarID partID"
  );
  const chapterList = []
  const chapterTitle = []
  const chapterLength = []

  const parts = await Part.find({ _id: { $in: tree.partID } });
  parts.map(part => {
    console.log(part.chapterID.length)
    // Chapter.find({ _id: part.chapterID }).exec((err, result) => {
    //   console.log(result.length)
    // });
    
  })
  // const chapter = await Chapter.find({ _id: chapterList });
  // chapter.forEach((element) => {
  //   chapterTitle.push(element.title);
  // });






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


