const Permission = require("../models/permissionsModel");

const json = require("body-parser")

exports.permissionRegister = async (req, res) => {
    const { permissionID, permissionName } = req.body
  
    const user = await Permission.create({
      permissionID,
      permissionName,
    })
    res.status(200).json({
      success: true,
      message: "Create permission successfully"
    })
  }


