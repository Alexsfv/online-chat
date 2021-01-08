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
                    console.log('Left', leftUser)

                    Object.entries(clients).forEach(([_, client]) => {
                        client.emit('leaveUser', leftUser)
                    })
                }
            )
        }
    )
}

module.exports = {
    leaveUser
}