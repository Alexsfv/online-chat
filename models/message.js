const { Schema, model } = require('mongoose')

const messageSchema = new Schema({
    text: {
        type: String,
        required: true
    },
    date: {
        type: Number,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})

module.exports = model('Message', messageSchema)