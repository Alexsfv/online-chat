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
        this.$usersListWrapper = document.querySelector('#users-list-wrapper')
        this.$toggleBtn = document.querySelector('#toggleBtn')
        this.$overlay = document.querySelector('#users-overlay')

        this.initListeners()
    }

    initListeners() {
        this.$toggleBtn.addEventListener('click', this.toggleUsersList.bind(this))
        this.$usersListWrapper.addEventListener('click', e => e.stopPropagation())
        this.$overlay.addEventListener('click', this.hideUsersList.bind(this))
    }

    addUser(user) {
        const li = document.createElement('li')
        li.classList.add('users__item')
        li.innerHTML = `
            <div class="users__item-img">
                <img src="${user.avatarUrl}" alt="${user.name}_avatar">
            </div>
            <p class="users__item-name">${user.name}</p>
        `
        this.$el.appendChild(li)
    }

    toggleUsersList() {
        if (this.$usersListWrapper.classList.contains('active')) {
            this.hideUsersList()
        } else {
            this.showUsersList()
        }
    }

    hideUsersList() {
        this.$usersListWrapper.classList.remove('active')
    }

    showUsersList() {
        this.$usersListWrapper.classList.add('active')
    }

    renderAll(users) {
        this.$el.innerHTML = ''
        users.map(user => this.addUser(user))
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
        this.$area = this.$el.querySelector('#msg')
        this.$btnSubmit = this.$el.querySelector('button')

        this.$btnSubmit.disabled = true
    }

    clearForm() {
        this.$area.value = ''
        this.$btnSubmit.disabled = true
    }

    disableValidate() {
        if (this.$area.textContent === '') {
            this.$btnSubmit.disabled = true
        } else {
            this.$btnSubmit.disabled = false
        }
    }
}

class MessageList {
    constructor(selector) {
        this.$el = document.querySelector(selector)
        this.$el_wrapper = document.querySelector('#message-list-wrapper')
    }

    addMessage(message, userId, withSound = false) {
        if (message.user._id === userId) {
            this.renderMessage(message, withSound, false)
        } else {
            this.renderMessage(message, withSound, true)
        }
    }

    deleteAllMessages() {
        this.$el.innerHTML = ''
    }

    scrollToEnd() {
        this.$el_wrapper.scrollTop = this.$el_wrapper.scrollHeight
    }

    playSoundNewMessage() {
        const audio = new Audio()
        audio.src = '../sound/newMessage.mp3'
        audio.autoplay = true
    }

    renderMessage(message, withSound, reverseCss) {
        if (chat.isLogin) {
            this.$el.innerHTML += `
            <li class="message-item ${reverseCss ? 'reverse' : ''}">
                <div class="message-item__body">
                    <p class="message-item__name">${message.user.name}</p>
                    <p class="message-item__time">${parseDate(message.date)}</p>
                    <p class="message-item__text">${message.text}</p>
                </div>
                <div class="message-item__avatar">
                    <img src="${message.user.avatarUrl}" alt="avatar">
                </div>
            </li>
            `
            this.scrollToEnd()
            if (withSound) {
                this.playSoundNewMessage()
            }
        }
    }
}

class UserInfoLine {
    constructor(selector) {
        this.$el = document.querySelector(selector)
        this.$usersListBtn = document.querySelector('#toggleBtn')
    }

    render(user) {

        const div = document.createElement('div')
        div.classList.add('user-info__img')
        div.innerHTML = `<img src="${user.avatarUrl}" alt="${user.name}_avatar">`

        const p = document.createElement('p')
        p.classList.add('user-info__name')
        p.innerHTML = `${user.name}`

        this.$el.insertBefore(div, this.$usersListBtn)
        this.$el.insertBefore(p, this.$usersListBtn)
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
        this.userInfoLine = new UserInfoLine('#user-info')

        this.modalLogin.showModalLogin('Введите имя пользователя')
        this.initListeners()
    }

    initListeners() {
        this.loginForm.$el.addEventListener('submit', this.submitUserLogin.bind(this))
        this.messageForm.$el.addEventListener('submit', this.submitMessageForm.bind(this))
        this.messageForm.$area.addEventListener('input', this.inputMessageHandler.bind(this))
        this.messageForm.$area.addEventListener('keydown', this.keydownMessageHandler.bind(this))
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
        const message = this.messageForm.$area.textContent
        this.messageForm.clearForm()

        if (message === '@clear') {
            socket.emit('clearAllmessages')
        }

        if (message.startsWith('@clear/')) {
            const userName = message.split('@clear/')[1]
            socket.emit('clearmessagesByUserName', userName)
        }

        if (message.startsWith('@ban/')) {
            const userName = message.split('@ban/')[1]
            socket.emit('disconnectByUserName', userName)
        }

        if (message) {
            const messageInfo = {
                text: message,
                date: Date.now()
            }
            this.messageForm.$area.textContent = ''
            socket.emit('sendMessage', messageInfo)
        }
    }

    keydownMessageHandler(e) {
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
        socket.emit('login', { name: this.user.name, avatarUrl: this.user.avatarUrl, isOnline: true })
        this.isLogin = true
    }

    async loadAvatar(url) {
        try {
            this.user.avatarUrl = await fetch(url).then(response => response.url)
        } catch (e) {
            console.log(e)
        }
    }
}