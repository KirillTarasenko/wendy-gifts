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

module.exports = { instance }