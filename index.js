const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)

const { Server } = require('socket.io')
const io = new Server(server)

const fs = require('fs')

const randomise = require('randomatic')

fs.readdirSync('Client').forEach(file => {
    if (file === 'index.html') {
        app.get('/', (req, res) => {
            res.sendFile(__dirname + '/Client/index.html')
        })
    } else {
        app.get(`/${file}`, (req, res) => {
            res.sendFile(`${__dirname}/Client/${file}`)
        })
    }
})


const rooms = {
    // Room code: Room name
}

const names = {
    // Socket id: Name
}

const currentRooms = {
    // Socket id: Room code
}

const messages = {
    // Room code: [Message]
}


function generateCode(name) {
    const code = randomise('A0', 4)
    if (!rooms[code]) { 
        rooms[code] = name
        return code
    }
    return generateCode()
}


function sendMessage(socket, msg) {
    const roomCode = currentRooms[socket.id]
    if (roomCode === null || roomCode === undefined) { return }
    if (!(roomCode in messages)) { messages[roomCode] = [] }
    messages[roomCode].push(msg)
    console.log(messages)
    io.to(roomCode).emit('chat message', msg)
}


io.on('connection', socket => {
    socket.on('disconnect', () => {
        const curr = currentRooms[socket.id]
        if (curr !== null && curr !== undefined) {
            socket.leave(curr)
        }
        
        sendMessage(socket, {
            user: socket.id,
            userName: names[socket.id],
            type: 'left'
        })

        delete names[socket.id]
        delete rooms[socket.id]
        delete currentRooms[socket.id]
    })

    socket.on('register', name => {
        names[socket.id] = name
        console.log(names)
    })

    socket.on('chat message', msg => {
        const msgObj = {
            user: socket.id,
            userName: names[socket.id],
            type: 'text',
            message: msg
        }

        sendMessage(socket, msgObj)
    })

    socket.on('create room', name => {
        const code = generateCode(name)
        socket.join(code)
        socket.emit('room joined', `${code}#${name}`)
    })

    socket.on('join room', code => {
        if (code.length !== 4) {
            socket.emit('error', 'Invalid code format: Room codes are always a combination of 4 alphanumeric characters.')
            return
        }

        const name = rooms[code.toUpperCase()]
        if (name) {
            socket.join(code)
            socket.emit('room joined', `${code}#${name}`)
        } else {
            socket.emit('error', `Room with code ${code} doesn't exist`)
        }
    })

    socket.on('open room', code => {
        const curr = currentRooms[socket.id]
        if (curr !== null && curr !== undefined) {
            socket.leave(curr)
        }

        sendMessage(socket, {
            user: socket.id,
            userName: names[socket.id],
            type: 'left'
        })

        currentRooms[socket.id] = code

        sendMessage(socket, {
            user: socket.id,
            userName: names[socket.id],
            type: 'joined'
        })

        socket.join(code)

        socket.emit('opened room', {
            roomCode: code,
            roomName: rooms[code],
            messages: []
        })
    })


    socket.on('get chat history', code => {
        if (code !== currentRooms[socket.id]) {
            socket.emit('error', 'Trying to access the history of a channel you haven\'t joined.')
            return
        }

        socket.emit('chat history', messages[code])
    })
})

server.listen(3000, () => {
    console.log(`server 🎧 on port 3000`)
})