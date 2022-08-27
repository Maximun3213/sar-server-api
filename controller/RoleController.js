const Role = require("../models/rolesModel");


const json = require("body-parser")

exports.roleRegister = async (req, res) => {
    const { roleID, roleName, permissionID } = req.body
  
    const user = await Role.create({
        roleID,
        roleName,
        permissionID
    })
    res.status(200).json({
      success: true,
      message: "Create role successfully"
    })
  }

