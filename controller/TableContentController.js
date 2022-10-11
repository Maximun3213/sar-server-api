const {
  TableOfContent,
  Part,
  Chapter,
  Criteria,
} = require("../models/tableContentModel");

const json = require("body-parser");
const { ObjectId } = require("mongodb");

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
  const parts = await Part.find({ _id: { $in: tree.partID } });

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
    { $unwind: "$chapters" },

    // {
    //   $graphLookup: {
    //     from: "criterias",
    //     startWith: "$chapters.criteriaID",
    //     connectFromField: "chapters.criteriaID",
    //     connectToField: "_id",
    //     as: "criterias",
    //   },
    // },
    // {
    //   $unwind: "$criterias",
    // },
    {
      $project: {
        partID: 0,
        // 'parts.chapterID': 0,
        // 'chapters.criteriaID': 0,
      },
    },
    {
      $group: {
        _id: "$_id",
        sarID: { $first: "$sarID" },
        parts: { $push: "$parts" },
        parts: {$addToSet: "$parts"},
        chapters: { $push: "$chapters" },
        count: { $sum: 1 },
        // criterias: { $push: "$criterias" },
      },
    },
  ]).exec((err, result) => {
    if (err) {
      return next(err);
    }
    res.send(result);
  });
  // await TableOfContent.aggregate([
  //   {
  //     $match: {
  //       sarID: ObjectId(req.params.id),
  //     },
  //   },

  //   {
  //     $graphLookup: {
  //       from: "parts",
  //       startWith: "$partID",
  //       connectFromField: "partID",
  //       connectToField: "_id",
  //       as: "parts",
  //     },
  //   },

  //   { $unwind: "$parts" },

  //   {
  //     $graphLookup: {
  //       from: "chapters",
  //       startWith:  "$parts.chapterID",
  //       connectFromField: "parts.chapterID",
  //       connectToField: "_id",
  //       as: "chapters",
  //     },
  //   },
  //   {
  //     $project: {
  //       partID: 0,
  //       "parts.chapterID": 0,
  //     },
  //   },

  // { $unwind: "$chapters" },
  // {
  //   $graphLookup: {
  //     from: "criterias",
  //     startWith: "$chapters.criteriaID",
  //     connectFromField: "chapters.criteriaID",
  //     connectToField: "_id",
  //     as: "criterias",
  //   },
  // },
  // {
  //   $project: {
  //     partID: 0,
  //     "chapters.criteriaID": 0,
  //   },
  // },
  // ]).exec((err, result) => {
  //   if (err) {
  //     return next(err);
  //   }
  //   res.send(result);
  // });
};
