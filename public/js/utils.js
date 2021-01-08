function parseDate(timeStamp) {
    const date = new Date(timeStamp)
    const year = date.getFullYear() + ''
    const month = dateWithZero(date.getMonth() + 1)
    const day = dateWithZero(date.getDate())
    const hours = dateWithZero(date.getHours())
    const min = dateWithZero(date.getMinutes())
    const sec = dateWithZero(date.getSeconds())

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