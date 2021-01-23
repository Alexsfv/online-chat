const User = require('./models/user')
const Message = require('./models/message')
const { replaceUserId, sortMessagesByDate } = require('./models/modelsUtils')

module.exports.leaveUser =  async function (clients, leftUserId, clientId) {
    if (clients[clientId]) {
        delete clients[clientId]
        await User.updateOne({ _id: leftUserId }, { isOnline: false })
        const onlineUsers = await User.find({ isOnline: true }, err => {if (err) throw err}).lean()

        Object.entries(clients).map(([_, client]) => {
            client.socket.emit('updateOnlineUsers', onlineUsers)
        })
    }
}

module.exports.checkAdminCommand = async function (message, clients, id) {
    const { text } = message
    if (text[0] === '@') {

        // clear all messages
        if (text === '@clear') {
            await Message.deleteMany({}, (err) => {
                if (err) throw err
                Object.entries(clients).map(([_, client]) => {
                    client.socket.emit('deleteAllMessages')
                })
            })

        // clear messages by last userName
        } else if (text.startsWith('@clear/')) {
            const userNameClear = text.split('@clear/')[1]
            const messages = await Message.find({})
                .populate('userId')
                .lean()
                .then(message => replaceUserId(message).reverse())

            const lastMessageOfCleanUser = messages.find(m => m.user.name === userNameClear)
            if (!lastMessageOfCleanUser) return true
            const userClear = lastMessageOfCleanUser.user

            await Message.deleteMany({ userId: userClear._id }, async (err) => {
                if (err) throw err
                const sortedMessages = await Message
                    .find({})
                    .populate('userId')
                    .lean()
                    .then(messages => sortMessagesByDate( replaceUserId(messages) ))

                Object.entries(clients).forEach(([_, client]) => {
                    client.socket.emit('renderAllMessages', sortedMessages)
                })
            })

        // ban user and delete his messages
        } else if (text.startsWith('@ban/')) {
            const userNameDelete = text.split('@ban/')[1]
            const bannedUser = await Message
                .find({}, (err) => {if (err) throw err})
                .populate('userId')
                .then(async messages => {
                    const lastMessageOfBannedUser = sortMessagesByDate(messages, -1)
                        .find(msg => msg.userId.name === userNameDelete)

                    if (lastMessageOfBannedUser) {
                        //if one and more message
                        return lastMessageOfBannedUser.userId
                    }
                })
            if (!bannedUser) return true
            const isSelfBan = bannedUser._id.toString() === clients[id].user._id.toString()
            if (isSelfBan) return true

            await Message.deleteMany({ userId: bannedUser._id }, (err) => {if (err) throw err})
            await User.findOneAndDelete({ _id: bannedUser._id }, (err) => {if (err) throw err})

            const messages = await Message
                .find({}, (err) => {if (err) throw err})
                .populate('userId')
                .lean()
                .then(messages => sortMessagesByDate(replaceUserId(messages)))

            Object.entries(clients).forEach(([_, client]) => {
                client.socket.emit('renderAllMessages', messages)
            })

            Object.entries(clients).forEach(([_, client]) => {
                if (client.user._id && bannedUser._id.toString() === client.user._id.toString()) {
                    client.socket.emit('ban')
                }
            })
        }
        return true
    }
    return false
}
