const http = require('http')
const express = require('express')
const { leaveUser, checkAdminCommand } = require('./serverUtils')

const mongoose = require('mongoose')
const User = require('./models/user')
const Message = require('./models/message')
const { replaceUserId } = require('./models/modelsUtils')

const app = express()
app.use(express.static('public'))

const server = http.createServer(app)
const io = require('socket.io')(server);
const clients = {}

mongoose.connect(`mongodb+srv://adm:40yIValcJrx9vwrU@cluster0.z702i.mongodb.net/chat?retryWrites=true&w=majority`, {useNewUrlParser: true, useUnifiedTopology: true})
User.updateMany({}, { isOnline: false }, (err) => {if (err) throw err})

io.on('connection', (socket) => {
    const clientId = Math.random()*100000 * Math.random()*100000 + ''
    clients[clientId] = { socket, user: {}}
    let user = {}

    socket.on('login', async (userData) => {
        try {
            user = new User(userData)
            clients[clientId].user = user
            await user.save(err => {if (err) throw err})

            const messages = await Message.find({})
                .populate('userId')
                .lean()
                .then(messages => replaceUserId(messages))
            const onlineUsers = await User.find({ isOnline: true })

            const initialData = {
                messages,
                onlineUsers,
                loggedUser: {
                    id: user._id,
                    name: user.name,
                    avatarUrl: user.avatarUrl
                }
            }

            // send init data
            Object.entries(clients).map(([cId, client]) => {
                if (clientId === cId) {
                    client.socket.emit('loginUser', initialData)
                }
            })

            Object.entries(clients).map(([_, client]) => {
                client.socket.emit('updateOnlineUsers', onlineUsers)
            })
        } catch (e) {
            console.log(e)
        }
    })

    socket.on('sendMessage', async (message) => {
        const isAdminCommand = await checkAdminCommand(message, clients, clientId)
        if (isAdminCommand) return false

        const msg = new Message({userId: user._id, ...message});
        msg.save(async err => {
            if (err) throw err

            const msgWithUser = await Message.findById(msg._id)
                .populate('userId')
                .lean()
                .then(message => replaceUserId(message))

            Object.entries(clients).forEach(([_, client]) => {
                client.socket.emit('newMessage', msgWithUser)
            })
        })
    })

    socket.on('disconnect', async () => {
        leaveUser(clients, user._id, clientId)
    })

    socket.on('exitUser', () => {
        leaveUser(clients, user._id, clientId)
    })

    socket.on('error', (err) => {
        console.log(err);
    })
})

app.get('/', (req, res) => {
    res.sendFile('./public/index.html')
})

app.get('/ban', (req, res) => {
    res.sendFile('./public/ban/index.html')
})

app.get('/*', (req, res) => {
    res.redirect('/')
})


const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`)
})