// use with .lean()
module.exports.replaceUserId = function(data) {
    if (Array.isArray(data)) {
        return data.map(obj => {
            obj.user = {...obj.userId}
            delete obj.userId
            return obj
        })
    } else if (data.userId) {
        const obj = {...data}
        obj.user = {...obj.userId}
        delete obj.userId
        return obj
    }
    return false
}

module.exports.sortMessagesByDate = function(messages, mod = 1) {
    return messages.sort((a, b) => (a.date - b.date) * mod)
}