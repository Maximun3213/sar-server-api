const {
  TableOfContent,
  Part,
  Chapter,
  Criteria,
} = require("../models/tableContentModel");

const json = require("body-parser");

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
