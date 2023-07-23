
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_BOT_KEY;
const bot = {
    onText: ()=>{},
    on: ()=>{}
}
//  new TelegramBot(token, { polling: true });

const sendTG = (text = "") => {
    fetch("https://api.telegram.org/bot6299454463:AAF5X22YunPdZ5o1ih_bL8XC-3z8xCwtGGs/sendMessage?chat_id=-1001830439757&text=" + text)
}

module.exports = { bot, sendTG }