require('colors')
const express = require('express')
const app = express()
const cors = require("cors")
const path = require('path')
const WebSocket = require('ws')
const jwt = require('jsonwebtoken')
const initDB = require('./database/init')
initDB()
const database = require("./database/Utils")
const authRouter = require('./routes/auth')
const config = require("./config")

const JWT_SECRET = config.JWT_SECRET



app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/liquid-index.html'))
})

app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/liquid-index.html'))
})

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/login/liquid.html'))
})

app.get('/login/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/login/liquid.html'))
})

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/register/liquid.html'))
})

app.get('/register/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/register/liquid.html'))
})

app.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/chat/liquid.html'))
})

app.get('/chat/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/chat/liquid.html'))
})

app.use(express.static(path.join(__dirname, '../frontend')))

app.use('/auth', authRouter)

const PORT = 6969
const server = app.listen(PORT, () => {
    console.log(`[i] Сервер запущен http://localhost:${PORT}`.blue)
})


const wss = new WebSocket.Server({ server })


const onlineUsers = new Map()


wss.on('connection', async (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`)
    const token = url.searchParams.get('token')

    if (!token) {
        console.log("НЕТ ТОКЕНА")
        ws.close()
        return
    }

    try {
        
        const decoded = jwt.verify(token, JWT_SECRET) 
        /*{
            id: 1,
            nickname: "",
            iat: 1710000000
        }*/
        ws.user = decoded
        onlineUsers.set(ws.user.id, ws)
        broadcastOnline()

        console.log(`+ ${ws.user.nickname} connected`.green)
        const messages = await database.getMessages()
        ws.send(JSON.stringify({
            type: 'history',
            messages
        }))

    } catch (err) {
        ws.close()
        return
    }


    ws.on('message', async (message) => {
        
        const text = message.toString()
        await database.saveMessage(ws.user.id, ws.user.nickname, text)

        const data = {
            type: 'message',
            user: ws.user.nickname,
            userId: ws.user.id,
            text: message.toString()
        }
        broadcast(data)
    })

    
    ws.on('close', () => {
        onlineUsers.delete(ws.user.id)
        broadcastOnline()

        console.log(`- ${ws.user.nickname} disconnected`.red)
    })
})


function broadcast(data) {
    const json = JSON.stringify(data)

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(json)
        }
    })
}

function broadcastOnline() {
    const users = Array.from(onlineUsers.values()).map(ws => ws.user.nickname)
    //массив из Мапа -> массив ников
    console.log(`Users onl: ${users}`)
    broadcast({
        type: 'online',
        users
    })
}
