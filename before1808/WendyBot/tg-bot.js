
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_BOT_KEY;
const bot = new TelegramBot(token, { polling: true });

const sendTG = (text = "") => {
  fetch("https://api.telegram.org/bot6299454463:AAF5X22YunPdZ5o1ih_bL8XC-3z8xCwtGGs/sendMessage?chat_id=-1001830439757&text=" + text)
}

const Statuses = {
  ADMINISTRATOR: 'administrator',
  BANNED: 'kicked',
  LEFT: 'left',
  MEMBER: 'member',
  OWNER: 'creator',
  RESTRICTED: 'restricted',
}

const checkTgIdInChannel = async (id = "457980948", chatId = '-1001959220092') => {
  try {
    const res = await fetch(`https://api.telegram.org/bot6299454463:AAF5X22YunPdZ5o1ih_bL8XC-3z8xCwtGGs/getChatMember?chat_id=${chatId}&user_id=${id}`).then(response => response.json());
    console.log("res.result", res, id);
    return [Statuses.ADMINISTRATOR, Statuses.OWNER, Statuses.MEMBER].includes(res?.result?.status);
  } catch (e) {
    console.log("checkId_+>", e);
    return false;
  }
}

module.exports = { bot, sendTG, checkTgIdInChannel }