const axios = require("axios");

const instance = axios.create({
    baseURL:
        "https://web-store-backend.hwm.prod.nexters.team/api/v1/hwm/",
    timeout: 10000,
    headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/vnd.api+json",
    },
});

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

const sendGiftByID = (id, nick) =>
    instance
        .post("bundles/free_energy/buy?filters[locale]=ru", {
            data: {
                // platform_buyer_id: SENDER_ID,
                // platform_recipient_id: "" + id,
                platform_buyer_id: "" + id,

            },
        })
        .then(() => {
            sendList.push(`${nick} (${id})`);
            return "[✅ Отправлено " + nick + " with id: (" + id + ")]";
        })
        .catch((error) => {
            const isGot = error.response?.data?.errors?.[0]?.status === "422";
            const errorMsg = (isGot
                ? "[🤦‍♂️ Уже брал "
                : "[🚫 Ошибка ") +
                nick +
                " with id: (" +
                id +
                ")] " +
                (isGot ? "" : JSON.stringify(error.response?.data));
            if (isGot) {
                gotList.push(`${nick} (${id})`);
            } else {
                problemsList.push({ nickname: nick, id, errorMsg });
            }

            return errorMsg;
        });



module.exports = { instance, checkNameById, sendGiftByID }