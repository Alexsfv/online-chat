const socket = io.connect('https://chat-alexsfv.herokuapp.com')
console.log('SOCKET Connected');

socket.on('loginUser', (data) => {
    chat.user.id = data.loggedUser.id
    chat.user.name = data.loggedUser.name
    chat.userInfoLine.render(data.loggedUser)
    data.messages.forEach(message => chat.messageList.addMessage(message, chat.user.id, false))
})

socket.on('updateOnlineUsers', (onlineUsers) => {
    if (onlineUsers) {
        chat.usersList.renderAll(onlineUsers)
    }
})

socket.on('newMessage', (message) => {
    let withSound = true
    if (chat.user.id === message.user._id) withSound = false
    chat.messageList.addMessage(message, chat.user.id, withSound)
})

// admin comands
socket.on('deleteAllMessages', () => {
    chat.messageList.deleteAllMessages()
})

socket.on('renderAllMessages', (messages) => {
    chat.messageList.deleteAllMessages()
    messages.forEach(m => {
        chat.messageList.addMessage(m, chat.user.id, false)
    })
})

socket.on('ban', () => {
    const banUrl = window.location.href + '/ban'
    window.location.replace(banUrl)
})
