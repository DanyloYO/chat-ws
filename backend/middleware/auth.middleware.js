const jwt = require('jsonwebtoken');
const config = require("../config")

const JWT_SECRET = config.JWT_SECRET

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            msg: "No token",
            ok: false
        });
    }

    const token = authHeader.split(' ')[1]

    try {
        const decoded = jwt.verify(token, JWT_SECRET)

        req.user = decoded; 
        next()
    } catch (err) {
        return res.status(401).json({
            msg: "Invalid token",
            ok: false
        });
    }
};