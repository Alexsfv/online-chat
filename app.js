const http = require('http')
const fs = require('fs')
const path = require('path')
const express = require('express')
const { leaveUser } = require('./serverUtils')

const app = express()
app.use(express.static('public'))

const server = http.createServer(app)
const io = require('socket.io')(server);

const clients = {}

// clear onlineUsers after start server
fs.readFile(
    path.join(__dirname, 'data', 'chat.json'),
    'utf-8',
    (err, content) => {
        if (err) throw err
        console.log('2222');
        let { messages, onlineUsers } = JSON.parse(content)
        onlineUsers = []
        fs.writeFile(
            path.join(__dirname, 'data', 'chat.json'),
            JSON.stringify({messages, onlineUsers}),
            (err) => {
                if (err) throw err
                console.log('Start clean users');
            }
        )
    }
)

io.on('connection', (socket) => {
    const id = Math.random()*100000 * Math.random()*100000 + ''
    clients[id] = socket

    socket.on('sendMessage', (message) => {

        console.log('sendMessage', message);

        fs.readFile(
            path.join(__dirname, 'data', 'chat.json'),
            'utf-8',
            (err, content) => {
                if (err) throw err
                const { messages, onlineUsers } = JSON.parse(content)
                messages.push(message)

                fs.writeFile(
                    path.join(__dirname, 'data', 'chat.json'),
                    JSON.stringify({ messages, onlineUsers }),
                    (err) => {
                        if (err) throw err
                        Object.entries(clients).forEach(([_, client]) => {
                            client.emit('newMessage', message)
                        })
                    }
                )
            }
        )
    })

    socket.on('login', (user) => {
        console.log('LOGIN', user);

        fs.readFile(
            path.join(__dirname, 'data', 'chat.json'),
            'utf-8',
            (err, content) => {
                if (err) throw err
                const { messages, onlineUsers } = JSON.parse(content)
                user.id = id

                onlineUsers.push(user)

                const initialData = {
                    messages,
                    onlineUsers,
                    initialUserId: id
                }

                // send init data
                Object.entries(clients).map(([clientId, client]) => {
                    console.log(clientId);
                    if (id === clientId) {
                        client.emit('loginUser', initialData)
                    }
                })

                Object.entries(clients).map(([clientId, client]) => {
                    if (clientId !== id) {
                        client.emit('userConnected', { payload: user })
                    }
                })

                fs.writeFile(
                    path.join(__dirname, 'data', 'chat.json'),
                    JSON.stringify({messages, onlineUsers}),
                    (err) => {
                        if (err) throw err
                        console.log(`User: ${user.name} is online add`)
                    }
                )
            }
        )
    })

    socket.on('disconnect', () => {
        if (clients[id]) {
            delete clients[id]
            leaveUser(clients, id)
        }
    })

    socket.on('exitUser', () => {
        leaveUser(clients, id)
    })

    socket.on('error', (err) => {
        console.log(err);
    })
})

app.get('/', (req, res) => {
    console.log('Request', req.url);
    res.sendFile('./public/index.html')
})

app.get('/*', (req, res) => {
    res.redirect('/')
})

server.listen(80, () => {
    console.log(`Server is running on port 80`)
})