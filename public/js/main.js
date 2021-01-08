const chat = new Chat('.chat')

chat.loadImg('https://picsum.photos/100/100')

window.onbeforeunload = function() {
    socket.emit('exitUser')
}