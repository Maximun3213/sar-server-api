const { SarFile, SarProofFolder } = require("../models/sarModel");
const {
  TableOfContent,
  Part,
  Chapter,
} = require("../models/tableContentModel");
const json = require("body-parser");
const { ObjectId } = require("mongodb");
const { aggregate } = require("../models/rolesModel");

exports.createSar = async (req, res, next) => {
  const ids = new ObjectId();
  const treeId = new ObjectId();
  const titleArr = [];
  const partID = [];
  const chapterID = [];
  const chapterLength = [];
  const tree = await TableOfContent.findOne();
  if (tree) {
    const parts = await Part.find({ _id: { $in: tree.partID } });

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
            // console.log(chapter.chapterID);
            Chapter.deleteMany({ _id: chapter.chapterID }).exec();
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

        SarFile.deleteOne({ _id: req.params.id }).exec((err) => {
          if (err) {
            console.log(err);
          }
          res.send("Delete Sar successfully");
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