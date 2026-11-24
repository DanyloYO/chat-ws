const jwt = require('jsonwebtoken')

const config = require("../config")
const JWT_SECRET = config.JWT_SECRET

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return next(); 
    }

    try {
        const token = authHeader.split(' ')[1]
        const decoded = jwt.verify(token, JWT_SECRET)

        req.user = decoded;
    } catch (err) {
        
    }

    next()
};