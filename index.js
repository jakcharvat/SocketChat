const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)

const { Server } = require('socket.io')
const io = new Server(server)

const fs = require('fs')

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


io.on('connection', socket => {
    console.log(`a 🧑‍💻 connected`)

    socket.on('disconnect', () => {
        console.log(`🧑‍💻 disconnected`)
    })

    socket.on('chat message', msg => {
        io.emit('chat message', msg)
    })
})

server.listen(3000, () => {
    console.log(`server 🎧 on port 3000`)
})