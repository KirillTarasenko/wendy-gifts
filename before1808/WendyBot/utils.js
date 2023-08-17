
const { instance } = require("./api");

const checkNameById = (id) => {
    return instance
        .get(`players/by-platform-player-id?filters[platform_player_id]=${id}&filters[locale]=ru`)
        .then((res) => {
            return { success: true, nickname: res.data.data.attributes.nickname };
        })
        .catch((error) => {
            return { success: false, error: id + " " + error?.response?.data?.errors[0].detail };
        });
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

module.exports = { accStr, checkNameById }