const { shuffle, uniqBy } = require("lodash");
const path = require('path');
const { groupBy } = require('lodash');
const fs = require('fs').promises;
const { checkNameById, waiter, accStr, getTime, getLabelTime } = require("./utils");
const { OWNER_ID, STEP_DELAY, CHECK_NAME_STEP_DELAY, ROLES_MODERATORS, ROLES_ADMIN, } = require("./constants");
const { FAQ_TEXT, BOT_HUCK_TEXT } = require("./strings");
const { bot, sendTgGroup, checkTgIdInChannel } = require("./tg-bot");
const DATA = require('./test.json');
const DATAO = require('./testO.json');
const schedule = require('node-schedule');

schedule.scheduleJob('0 10 2 * * *', function () {
  bot.sendMessage(OWNER_ID, "[job send gifts] 5:10 MSK");
  sendGifts();
});
schedule.scheduleJob('0 0 7 * * 7', function () {
  bot.sendMessage(OWNER_ID, "[job service] ВС 10:00 MSK");
  checks();
});

const NOBODY_TEXT = "🤷‍♂️";

let gotList = [];
let sendList = [];
let problemsList = [];

const USERS_PERSIST_PATH = path.join(process.cwd(), 'users.json');

async function loadSavedUsersIfExist() {
  try {
    const content = await fs.readFile(USERS_PERSIST_PATH);
    addedUsers = uniqBy(JSON.parse(content), 'id');
  } catch (err) {
    console.log("=>", err);
    return null;
  }
}

loadSavedUsersIfExist();


let addedUsers = [];
let isPauseBot = false;

const canPassRole = (msg, perms) => {
  return !perms || perms.includes(msg.from.id);
}


bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id,
    "Привет. Я бот с Wendy подарками.\nЧтобы добавить аккаунт в рассылку:\n\n1. Вызвать команду с вашим ID '/add 12233334444'\n\n2. Быть участником канала: https://t.me/wendy_bot_news");
});


bot.onText(/\/add/, async (msg) => {
  await adding(msg);
});

const adding = async (msg) => {
  if (isPauseBot) {
    bot.sendMessage(msg.chat.id, "🧑‍💻⏰ Бот отдыхает. Новые заявки временно не принимаются. Следите за новостями тут - https://t.me/wendy_bot_news", {
      reply_to_message_id: msg.message_id,
    });
    return;
  }

  if (msg.text === '/add@daily_wendy_gift_bot') {
    return;
  }

  const id = msg.text.match(new RegExp(/[0-9]+/gm))?.[0];
  if (!id) {
    bot.sendMessage(msg.chat.id, "Нужно указать id. Например /add 1223334444.", {
      reply_to_message_id: msg.message_id,
    });
    return;
  }
  const haveIDInTgChannel = await checkTgIdInChannel(msg.from.id);

  const isHaveInTable = !!addedUsers.find(e => (+e.id === +id) && (e.tgId === msg.from.id));
  if (isHaveInTable) {
    if (haveIDInTgChannel) {
      bot.sendMessage(msg.chat.id, "✅🎁 Все условия выполнены. Этот Аккаунт участвует в рассылке 🎁.", {
        reply_to_message_id: msg.message_id,
      });
    } else {
      bot.sendMessage(msg.chat.id, "🚫🎁 Такой Аккаунт есть в списке рассылки, но ему не придет энергия 👿. Нужно быть подписанным на https://t.me/wendy_bot_news", {
        reply_to_message_id: msg.message_id,
      });
    }
    return;
  }
  const res = await checkNameById(id);
  if (res.success) {
    bot.sendMessage(msg.chat.id, `✅⏰ ${id} добавлен в рассылку. Напоминаем что, подписка на https://t.me/wendy_bot_news, является обязательным условием для участия в рассылке. \nВы можете проверить свой статус командой /metest@daily_wendy_gift_bot`, {
      reply_to_message_id: msg.message_id,
    });
    addedUsers.push({ nickname: res.nickname, id, tg: msg.from?.username, tgId: msg.from?.id });
    fs.writeFile(USERS_PERSIST_PATH, JSON.stringify(addedUsers));
    console.log("➕ " + res.nickname + " " + id);
  } else {
    bot.sendMessage(msg.chat.id, res.error);
  }
}

bot.on("message", async (msg) => {
  console.log(msg);
  console.log(`${msg.from.username} ${msg.from.id}: ${msg.text}`);
  if (!msg.text) {
    return;
  };
  if (msg.text.startsWith("/faq")) {
    bot.sendMessage(msg.chat.id, FAQ_TEXT);
    return;
  }

  if (msg.text.startsWith("/info")) {
    bot.sendMessage(msg.chat.id, `Cтатус бота: ${isPauseBot ? '🧑‍💻⏰ Бот отдыхает' : '✅ Бот принимает заявки'} \nОсновной канал - https://t.me/wendy_bot_news\n\n Обсуждение - https://t.me/daily_wendy_gifts\n ⏰ В рассылке: ${addedUsers?.length || 0} аккаунтов\n/add id = Добавляет аккаунт в рассылку\nРассылка на все аккаунты займет примерно ${getTime(addedUsers?.length)}`, {
      reply_markup: JSON.stringify({
        hide_keyboard: true
      })
    });
    return;
  }

  if (canPassRole(msg, ROLES_ADMIN) && msg.text.startsWith("/run")) {
    sendTgGroup("🎉 Бот снова начинает принимать заявки.🎉");
    isPauseBot = false;
    return;
  }
  if (canPassRole(msg, ROLES_ADMIN) && msg.text.startsWith("/stop")) {
    sendTgGroup("🕺🏻 Бот отправлен отдыхать 💃🏻");
    isPauseBot = true;
    return;
  }

  if (canPassRole(msg, ROLES_ADMIN) && msg.text.startsWith("/backup")) {
    backup();
    return;
  }
  // ============================== PAUSE HERE ==============================
  if (isPauseBot || !msg.text) {
    return;
  }

  if (msg.text === "/metest@daily_wendy_gift_bot") {
    const id = msg.text.match(new RegExp(/[0-9].+/gm))?.[0];
    const haveIDInTgChannel = await checkTgIdInChannel(id);
    const groupTgId = groupBy(addedUsers, "tgId")[msg.from.id];
    if (haveIDInTgChannel) {
      const botMsg = `✅🎁 Все условия выполнены. У вас ${accStr(groupTgId.length)} участвуют в рассылке:\n ${groupTgId.map(e => e.nickname).join(", ")}`.slice(0, 4092);
      bot.sendMessage(msg.chat.id, botMsg + (botMsg.length > 4091 ? "..." : ""), {
        reply_to_message_id: msg.message_id,
      });
    } else {
      bot.sendMessage(msg.chat.id, `🚫🎁 Вы добавили ${accStr(groupTgId.length)}, но вам так же нужно подписаться на https://t.me/wendy_bot_news, чтобы получать энергию`, {
        reply_to_message_id: msg.message_id,
      });
    }
    return;
  }

  if (msg.text.toLowerCase().startsWith("id") || msg.text.startsWith("/Add") || msg.text.toLowerCase().startsWith("add") || msg.text.match(new RegExp(/^\d+$/))?.[0]) {
    bot.sendMessage(msg.chat.id, "Нужно указать /add и ID в одном предложении. Например:\n/add 1223334444", { reply_to_message_id: msg.message_id, });
    return;
  }

  if (msg.reply_to_message?.text === BOT_HUCK_TEXT) {
    adding({ ...msg, text: "/add " + msg.text?.trim() });
    return;
  }

  if (canPassRole(msg, ROLES_ADMIN) && msg.text.startsWith("/gifts")) {
    const lastCount = msg.text.match(new RegExp(/[0-9].+/gm))?.[0];
    bot.sendMessage(msg.chat.id, `Last count: ${lastCount}, General count: ${addedUsers?.length}`, { reply_to_message_id: msg.message_id, });
    sendGifts(addedUsers?.length - lastCount);
    return;
  }

  if (msg.text.startsWith("/add@daily_wendy_gift_bot")) {
    bot.sendMessage(msg.chat.id, BOT_HUCK_TEXT, {
      reply_to_message_id: msg.message_id,
      reply_markup: {
        force_reply: true,
      }
    });
    return;
  }


  if (canPassRole(msg, ROLES_ADMIN) && msg.text.startsWith("/checks")) {
    checks(msg);
    return;
  }

  if (canPassRole(msg, ROLES_MODERATORS) && msg.text.startsWith("/remove")) {
    const id = msg.text.match(new RegExp(/[0-9]+/gm))?.[0];
    const isHaveInTable = !!addedUsers.find(e => +e.id === +id);
    if (isHaveInTable) {
      addedUsers = addedUsers.filter(e => +e.id !== +id);
      fs.writeFile(USERS_PERSIST_PATH, JSON.stringify(addedUsers));
      bot.sendMessage(msg.chat.id, `✅🗑 ${id} удален из рассылки`, {
        reply_to_message_id: msg.message_id,
      });
    } else {
      bot.sendMessage(msg.chat.id, `🚫🗑 ${id} нет такого ID в рассылке`, {
        reply_to_message_id: msg.message_id,
      });
    }
    return;
  }

});


const sendGifts = async () => {
  gotList = [];
  sendList = [];
  problemsList = [];
  try {
    sendTgGroup(`🎉 Начинаем рассылать энергию на почту 🎉. \n\n Продолжительность: \n\n Проверка подписчиков: ${getTime(Object.keys(groupByTgId).length, TG_CHECK_DELAY)} \n\nРаздача: ${getTime(addedUsers.length, CHECK_NAME_STEP_DELAY)}\n\n Скоро к вам на почту придет письмо с +60 энергии`);

    const groupByTgId = groupBy(addedUsers, "tgId");
    let delayCheck = 0;
    let validTgs = [];
    const TG_CHECK_DELAY = 80;

    Object.keys(groupByTgId).forEach((id, index, arr) => {
      setTimeout(() => {
        checkTgIdInChannel(id).then(haveId => {
          if (haveId) {
            validTgs.push(id);
          }
          console.log(index, id, haveId);
          if (index === arr.length - 1) {
            setTimeout(() => {
              const validListNameFile = `logs/validTgs-${new Date().getDate()}-${new Date().getMonth()}-${new Date().getFullYear()}_${new Date().getHours()}:${new Date().getMinutes()}`;
              fs.writeFile(validListNameFile, JSON.stringify(validTgs));
              let delay = 0;

              shuffle(addedUsers.filter(e => validTgs.includes(e.tgId))).forEach(({ nickname: name, id }, index, arr) => {
                setTimeout(() => {
                  sendGiftByID(id, name).then((result) => console.log(result));
                }, STEP_DELAY + delay);
                if (index === arr.length - 1) {
                  setTimeout(() => {
                    const gots = gotList.join(', ');
                    const sends = sendList.join(', ');
                    sendTgGroup("⛔ Ошибки: " + (problemsList?.length || NOBODY_TEXT));
                    const sendedMSG = `🐢 Отправлено ${getLabelTime()}: ${sendList?.length || 0} шт(это ${(sendList.length || 0) * 60} энергии)`;
                    sendTgGroup(sendedMSG);
                    bot.sendMessage(OWNER_ID, sendedMSG);
                    sendTgGroup(`🤦‍♂️ Уже взяли бесплатную энергию: ${gotList?.length || 0} шт`);
                  }, STEP_DELAY + delay + 10000);

                  setTimeout(() => {
                    sendTgGroup(`🥹🥹🥹 Раздача закончилась - проверяйте почту. Вы можете добавлять согильдицев / друзей - пишите / add id\n\n Основной канал - https://t.me/wendy_bot_news\n\n Пригласительная на чат - https://t.me/daily_wendy_gifts`);
                  }, STEP_DELAY + delay + 15000);
                }

                delay += CHECK_NAME_STEP_DELAY;
              });
            }, delayCheck + 5000)
          }
        });
      }, delayCheck)
      delayCheck += TG_CHECK_DELAY;
    });

  } catch (err) {
    console.log("Some Google Error ", err);
    bot.sendMessage(OWNER_ID, "[ERROR-gifts]" + JSON.stringify({ err }));
  }
};

const backup = () => {
  const nameFile = `${new Date().getDate()}-${new Date().getMonth()}-${new Date().getFullYear()}_${new Date().getHours()}:${new Date().getMinutes()}`;
  fs.copyFile('users.json', `backups/${nameFile}.json`, fs.constants.COPYFILE_FICLONE_FORCE);
  console.log("Создали backup " + nameFile);
}

const checks = async (msg) => {
  let problems = [];
  let updatedAddedUsers = [];
  try {
    backup();
    isPauseBot = true;
    sendTgGroup(`🧑‍💻⏰ Началось плановое серверное обслуживание базы бота.\n\n Новые заявки временно не принимаются. Следите за новостями тут - https://t.me/wendy_bot_news`);

    const groupByTgId = groupBy(addedUsers, "tgId");
    let delayCheck = 0;
    let validTgs = [];
    const TG_CHECK_DELAY = 80;

    Object.keys(groupByTgId).forEach((id, index, arr) => {
      setTimeout(() => {
        checkTgIdInChannel(id).then(haveId => {
          if (haveId) {
            validTgs.push(id);
          }
          console.log(index, id, haveId);
          if (index === arr.length - 1) {
            setTimeout(() => {
              const validListNameFile = `logs/validTgs-${new Date().getDate()}-${new Date().getMonth()}-${new Date().getFullYear()}_${new Date().getHours()}:${new Date().getMinutes()}`;
              fs.writeFile(validListNameFile, JSON.stringify(validTgs));
              let delay = 0;

              shuffle(addedUsers.filter(e => validTgs.includes(e.tgId))).forEach((entity, index, arr) => {
                const { nickname: name, id } = entity;
                setTimeout(() => {
                  checkNameById(id).then((result) => {
                    if (result.success) {
                      updatedAddedUsers.push({ ...entity, nickname: result.nickname });
                    } else {
                      problems.push({ nickname: name, id: id, error: result.error })
                    }
                  });
                }, CHECK_NAME_STEP_DELAY + delay);

                if (index === arr.length - 1) {
                  setTimeout(() => {
                    const errorsNameFile = `logs/problems-${new Date().getDate()}-${new Date().getMonth()}-${new Date().getFullYear()}_${new Date().getHours()}:${new Date().getMinutes()}`;
                    const newListNameFile = `logs/newlist-${new Date().getDate()}-${new Date().getMonth()}-${new Date().getFullYear()}_${new Date().getHours()}:${new Date().getMinutes()}`;
                    addedUsers = updatedAddedUsers;
                    fs.writeFile(errorsNameFile, JSON.stringify(problems));
                    fs.writeFile(newListNameFile, JSON.stringify(updatedAddedUsers));
                    fs.writeFile(USERS_PERSIST_PATH, JSON.stringify(updatedAddedUsers));

                    isPauseBot = false;
                    sendTgGroup("🎉 Бот снова начинает принимать заявки.🎉");

                  }, CHECK_NAME_STEP_DELAY + delay + 15000);
                }
                delay += CHECK_NAME_STEP_DELAY;
              });
            }, delayCheck + 5000)
          }
        });
      }, delayCheck)
      delayCheck += TG_CHECK_DELAY;
    });
  } catch (err) {
    console.log("Some Google Error ", err);
    bot.sendMessage(OWNER_ID, "[ERROR-checks]" + JSON.stringify({ err }));
  }
}
