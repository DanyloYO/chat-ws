const express = require('express')
const database = require("../database/Utils")
const router = express.Router()
const bcrypt = require('bcrypt')
const { validateRegister } = require('./validator')
const jwt = require('jsonwebtoken')
const sendTG = require("./botTG")
const config = require("../config")
const JWT_SECRET = config.JWT_SECRET

router.post('/register', async (req, res) => {
    const {nickname, password } = req.body 
    const error = validateRegister(req.body)
    if (error) {
        return res.status(400).json({
            msg: error,
            ok: false
        })
    }
    const user = await database.findUser(nickname)
    if(user){
        return res.status(400).json({
            msg:"This nickname is unavailable",
            ok: false
        })
        
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    await database.createUser(nickname, hashedPassword)
    await sendTG(nickname)
    return res.status(201).json({
        msg: "User created",
        ok: true
    })
})

router.post("/login", async (req,res) => {
    const { nickname, password } = req.body
    if (!nickname || !password) {
        return res.status(400).json({
            msg: "Nickname and password required",
            ok: false
        })
    }
    const user = await database.findUser(nickname)
    if (!user) {
        return res.status(401).json({
            msg: "Invalid credentials",
            ok: false
        })
    }
    const isMatch = await bcrypt.compare(password, user.password)
 
   
    if (!isMatch) {
        return res.status(401).json({
            msg: "Invalid credentials",
            ok: false
        })
    }
    const token = jwt.sign(
        { id: user.id, nickname: user.username },
        JWT_SECRET,
        { expiresIn: '11d' }
    )

    return res.status(200).json({
        msg: "Login successful",
        ok: true,
        token
    })

})

module.exports = router