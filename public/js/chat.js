class ModalLogin {
    constructor(selector) {
        this.$el = document.querySelector(selector)
        this.$message = this.$el.querySelector('p')
    }

    showModalLogin(message) {
        this.$el.classList.add('active')
        this.$message.textContent = message
    }

    hideModalLogin() {
        this.$el.classList.remove('active')
        this.$message.textContent = ''
    }
}

class UsersList {
    constructor(selector) {
        this.$el = document.querySelector(selector)
        this.users = []
    }

    addUser(user) {
        if (user) {
            this.users.push(user)
            this.renderUsers()
        }
    }

    removeUser(user) {
        if (user) {
            this.users = this.users.filter(u => u.id !== user.id)
            this.renderUsers()
        }
    }

    renderUsers() {
        let usersHTML = ''
        this.users.forEach(user => {
            usersHTML += `<li>${user.name}</li>`
        })
        this.$el.innerHTML = usersHTML
    }
}

class LoginForm {
    constructor(selector) {
        this.$el = document.querySelector(selector)
        this.$validateMessage = document.querySelector('#login-validate')
        this.$sucessMessage = document.querySelector('#sucess-login')
    }

    showValidateMessage(message) {
        this.$validateMessage.textContent = message
        this.$validateMessage.classList.add('active')
    }

    hideValidateMessage() {
        this.$validateMessage.textContent = ''
        this.$validateMessage.classList.remove('active')
    }

    sucessLogin(name) {
        this.$el.style.display = 'none'
        this.$sucessMessage.innerHTML = `<p>Ваше имя: <span class="username-sucess">${name}</span></p>`
    }
}

class MessageForm {
    constructor(selector) {
        this.$el = document.querySelector(selector)
        this.$area = this.$el.querySelector('textarea')
        this.$btnSubmit = this.$el.querySelector('button')

        this.$btnSubmit.disabled = true
    }

    clearForm() {
        this.$area.value = ''
    }

    disableValidate() {
        if (this.$area.value === '') {
            this.$btnSubmit.disabled = true
        } else {
            this.$btnSubmit.disabled = false
        }
    }
}

class MessageList {
    constructor(selector) {
        this.$el = document.querySelector(selector)
    }

    addMessage(message, withSound = false) {
        this.renderMessage(message, withSound)
    }

    scrollToEnd() {
        this.$el.scrollTop = this.$el.scrollHeight
    }

    playSoundNewMessage() {
        const audio = new Audio()
        audio.src = '../sound/newMessage.mp3'
        audio.autoplay = true
    }

    renderMessage(message, withSound) {
        if (chat.isLogin) {
            this.$el.innerHTML += `
            <li class="message">
                <p class="message-title">${message.user.name} <span>${parseDate(message.date)}</span></p>
                <p class="message-text">${message.text}</p>
            </li>
            `
            this.scrollToEnd()
            if (withSound) {
                this.playSoundNewMessage()
            }
        }
    }
}

class Chat {
    user = {
        name: '',
        id: '',
        avatarUrl: '../img/defaultImg.jpg'
    }
    isLogin = false

    constructor(selector) {
        this.$el = document.querySelector(selector)
        this.loginForm = new LoginForm('#login-form')
        this.usersList = new UsersList('#users-list')
        this.messageForm = new MessageForm('#message-form')
        this.messageList = new MessageList('#message-list')
        this.modalLogin = new ModalLogin('#modal-login')

        this.modalLogin.showModalLogin('Введите имя пользователя')
        this.initListeners()
    }

    initListeners() {
        this.loginForm.$el.addEventListener('submit', this.submitUserLogin.bind(this))
        this.messageForm.$el.addEventListener('submit', this.submitMessageForm.bind(this))
        this.messageForm.$area.addEventListener('input', this.inputMessageHandler.bind(this))
        this.messageForm.$area.addEventListener('keydown', this.keydownMwssageHandler.bind(this))
    }

    submitUserLogin(e) {
        e.preventDefault()
        this.user.name = this.loginForm.$el.elements.name.value
        if (this.user.name) {
            this.loginForm.hideValidateMessage()
            this.loginForm.sucessLogin(this.user.name)
            this.modalLogin.hideModalLogin()

            this.loginUser()
        } else {
            this.loginForm.showValidateMessage('Введите имя')
        }
    }

    sendMessage() {
        const message = this.messageForm.$el.elements.msg.value
        if (message) {
            this.messageForm.clearForm()
            this.messageForm.$btnSubmit.disabled = true
            const messageInfo = {
                user: this.user,
                text: message,
                date: Date.now()
            }
            socket.emit('sendMessage', messageInfo)
        }
    }

    keydownMwssageHandler(e) {
        if (e.key === 'Enter' && !e.ctrlKey) {
            e.preventDefault()
            this.sendMessage()
        } else if (e.key === 'Enter' && e.ctrlKey) {
            this.messageForm.$el.elements.msg.value += '\n'
        }
    }

    inputMessageHandler() {
        this.messageForm.disableValidate()
    }

    submitMessageForm(e) {
        e.preventDefault()
        this.sendMessage()
    }

    loginUser() {
        socket.emit('login', { name: this.user.name })
        this.isLogin = true
    }

    loadAllMessages(messages) {
        messages.forEach(message => {
            this.messageList.addMessage(message, false)
        })
    }

    loadAllUsers(users) {
        users.forEach(user => {
            this.usersList.addUser(user)
        })
    }

    async loadImg(url) {
        try {
            this.avatarUrl = await fetch(url).then(response => response.url)
        } catch (e) {
            console.log(e)
        }
    }
}