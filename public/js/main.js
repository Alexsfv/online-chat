const chat = new Chat('.chat')

chat.loadAvatar('https://picsum.photos/100/100')

window.onbeforeunload = function() {
    socket.emit('exitUser')
}