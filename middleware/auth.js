
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.roleID)){
            return res.sendStatus(`${req.user.fullName} cannot be execute this task`)
        }
        next()
    }
}