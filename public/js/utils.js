function parseDate(timeStamp) {
    const now = new Date()
    const date = new Date(timeStamp)
    const year = date.getFullYear() + ''
    const month = dateWithZero(date.getMonth() + 1)
    const day = dateWithZero(date.getDate())
    const hours = dateWithZero(date.getHours())
    const min = dateWithZero(date.getMinutes())
    const sec = dateWithZero(date.getSeconds())

    const dayNow = dateWithZero(now.getDate())
    const yearNow = dateWithZero(now.getFullYear())
    const monthNow = dateWithZero(now.getMonth() + 1)

    if (monthNow !== month || yearNow !== year) {
        return `${day}-${month}-${year}`
    } else if (dayNow !== day) {
        return `${hours}:${min} (${day}-${month})`
    }
    return `${hours}:${min}`
}

function dateWithZero(num) {
    let string = num + ''
    if (string.length === 1) {
        return 0 + string
    } else {
        return string
    }
}

function getRandomId() {
    return Math.random()*100000 * Math.random()*100000 * Math.random()*100000+ ''
}