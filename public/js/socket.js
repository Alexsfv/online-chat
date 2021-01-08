const socket = io.connect('http://a0501312.xsph.ru')
console.log('SOCKET Connected');

socket.on('loginUser', (data) => {
    chat.loadAllMessages(data.messages)
    chat.loadAllUsers(data.onlineUsers)
    chat.user.id = data.initialUserId
})

socket.on('userConnected', (data) => {
    if (chat.isLogin) {
        chat.usersList.addUser(data.payload)
    }
})

socket.on('leaveUser', (leftUser) => {
    chat.usersList.removeUser(leftUser)
})

socket.on('newMessage', (message) => {
    let withSound = true
    if (chat.user.id === message.user.id) withSound = false
    chat.messageList.addMessage(message, withSound)
})