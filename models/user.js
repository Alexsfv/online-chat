const { Schema, model } = require('mongoose')

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    avatarUrl: {
        type: String,
        required: true
    },
    isOnline: {
        type: Boolean,
        required: true
    }
})

module.exports = model('User', userSchema)