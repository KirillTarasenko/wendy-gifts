
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

module.exports = { checkNameById }