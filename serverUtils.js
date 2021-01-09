const fs = require('fs')
const path = require('path')

function leaveUser(clients, leaveUserId) {
    fs.readFile(
        path.join(__dirname, 'data', 'chat.json'),
        'utf-8',
        (err, content) => {
            if (err) throw err
            const { messages, onlineUsers } = JSON.parse(content)

            const leftUser = onlineUsers.find(user => user.id === leaveUserId)
            const withoutLeftUser = onlineUsers.filter(user => user.id !== leaveUserId)

            fs.writeFile(
                path.join(__dirname, 'data', 'chat.json'),
                JSON.stringify({messages, onlineUsers: withoutLeftUser}),
                (err) => {
                    if (err) throw err

                    if (leftUser) {
                        Object.entries(clients).forEach(([_, client]) => {
                            client.emit('leaveUser', leftUser)
                        })
                    }
                }
            )
        }
    )
}

function checkAdminCommand(message, clients, id) {
    const { text } = message
    if (text[0] === '@') {

        fs.readFile(
            path.join(__dirname, 'data', 'chat.json'),
            'utf-8',
            (err, content) => {
                if (err) console.log(err)
                const data = JSON.parse(content)

                // clear all messages
                if (text === '@clear') {
                    data.messages = []
                    fs.writeFile(
                        path.join(__dirname, 'data', 'chat.json'),
                        JSON.stringify(data),
                        (err) => {
                            if (err) console.log(err)
                            Object.entries(clients).map(([_, client]) => {
                                client.emit('deleteAllMessages')
                            })
                        }
                    )

                // clear messages by last userName
                } else if (text.startsWith('@clear/')) {
                    const userNameDelete = text.split('@clear/')[1]
                    const lastUserMessage = data.messages.reverse().find(m => m.user.name === userNameDelete)
                    const messages = data.messages

                    const filteredMessages = messages.filter(m => m.user.id !== lastUserMessage.user.id).reverse()
                    data.messages = filteredMessages
                    fs.writeFile(
                        path.join(__dirname, 'data', 'chat.json'),
                        JSON.stringify(data),
                        (err) => {
                            if (err) throw err
                            Object.entries(clients).forEach(([_, client]) => {
                                client.emit('renderAllMessages', filteredMessages)
                            })
                        }
                    )

                // ban user and delete his messages
                } else if (text.startsWith('@ban/')) {
                    const userNameDelete = text.split('@ban/')[1]
                    const bannedUser = data.onlineUsers.reverse().find(user => user.name === userNameDelete && user.id !== id)

                    if (bannedUser) {
                        const filteredMessages = data.messages.filter(m => m.user.id !== bannedUser.id)
                        data.messages = filteredMessages

                        fs.writeFile(
                            path.join(__dirname, 'data', 'chat.json'),
                            JSON.stringify(data),
                            (err) => {
                                if (err) throw err
                                Object.entries(clients).forEach(([_, client]) => {
                                    client.emit('renderAllMessages', filteredMessages)
                                })
                                Object.entries(clients).forEach(([clientId, client]) => {
                                    if (clientId === bannedUser.id) {
                                        client.emit('ban')
                                    }
                                })
                            }
                        )
                    }
                }
            }
        )
        return true
    }
    return false
}

module.exports = {
    leaveUser,
    checkAdminCommand
}