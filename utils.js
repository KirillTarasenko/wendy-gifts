const dayjs = require('dayjs');

const waiter = (delayMS = 0) => new Promise(resolve => setTimeout(resolve, delayMS));

const minutesStr = count => {
    if (count % 10 === 1 && count % 100 !== 11) {
        return ' минута';
    } else if (
        [2, 3, 4].indexOf(count % 10) >= 0 &&
        [12, 13, 14].indexOf(count % 100) < 0
    ) {
        return ' минуты';
    } else {
        return ' минут';
    }
};

const accStr = count => {
    if (count % 10 === 1 && count % 100 !== 11) {
        return count + ' аккаунт';
    } else if (
        [2, 3, 4].indexOf(count % 10) >= 0 &&
        [12, 13, 14].indexOf(count % 100) < 0
    ) {
        return count + ' аккаунта';
    } else {
        return count + ' аккаунтов';
    }
};

const getTime = (count, multi = STEP_DELAY) => {
    const minuts = Math.round((multi * count) / 60000);
    return minuts + minutesStr(minuts)
};


const getLabelTime = () => `МСК (+3 utc) ${dayjs().add(3, 'hours').format("DD-MM-YYYY HH:mm:ss")}`

module.exports = { waiter, accStr, minutesStr, getLabelTime, getTime }