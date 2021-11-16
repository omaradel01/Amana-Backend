function errorHandler(err, req, res, next) {
    // for requesting API without without having a token
    if (err.name === "UnauthorizedError") {
        return res.status(401).json({
            message: "The User is not authorized"
        })
    }
    // for uploading images and files
    if (err.name === "ValidationError") {
        return res.status(401).json({
            message: err
        })
    }
    // 500 status server error
    return res.status(500).json(err)
}
module.exports = errorHandler;