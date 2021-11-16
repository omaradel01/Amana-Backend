const jwt = require('jsonwebtoken');

// dotenv configuration 
require('dotenv/config')
module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        console.log(token)
        if (!token) {
            return res.status(401).json({
                msg: 'No token, authorization denied'
            });
        }
        jwt.verify(token, process.env.SECRET, (err, user) => {
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};