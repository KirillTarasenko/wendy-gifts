const { parse } = require("csv-parse");
const { shuffle, uniqBy, groupBy } = require("lodash");
const { instance } = require("./api");
const path = require('path');
const fs = require('fs').promises;
const { checkNameById, accStr } = require("./utils");
const { bot, sendTG, checkTgIdInChannel } = require("./tg-bot");
const dayjs = require('dayjs')
const schedule = require('node-schedule');

let jobGifts;
let jobService;


// job send gifts 5:10 MSK
jobGifts = schedule.scheduleJob('0 10 2 * * *', function() {
  bot.sendMessage(OWNER_ID, "[job send gifts] 5:10 MSK");
  sendGifts();
});

// job service СБ 10:00 MSK
jobService = schedule.scheduleJob('0 0 7 * * 7', function() {
  bot.sendMessage(OWNER_ID, "[job service] СБ 10:00 MSK");
  checks();
});


let addedUsers = [];
let isPauseBot = false;

const STASY_TG = 985612311;
const ASSOL7I_TG = 1100707268;
const OWNER_ID = 457980948;


const STEP_DELAY = 800;
const CHECK_NAME_STEP_DELAY = 400;
const MODERATORS = [STASY_TG, ASSOL7I_TG];

const ROLES_MODERATORS = [...MODERATORS, OWNER_ID];
const ROLES_ADMIN = [OWNER_ID];

const canPassRole = (msg, perms) => {
  return !perms || perms.includes(msg.from.id);
}

const USERS_PERSIST_PATH = path.join(process.cwd(), 'users.json');
const getLabelTime = () => `МСК (+3 utc) ${dayjs().add(3, 'hours').format("DD-MM-YYYY HH:mm:ss")}`

async function loadSavedUsersIfExist() {
  try {
    const content = await fs.readFile(USERS_PERSIST_PATH);
    addedUsers = uniqBy(JSON.parse(content), 'id');
  } catch (err) {
    console.log("=>", err);
    return null;
  }
}

const FAQ_TEXT = `
Напоминаем о часто задаваемых вопросах:

Основная раздача: Начало 5:10 мск (если прописать /info можно увидеть примерно сколько длится раздача)

Ответы на вопросы:

Вопрос: Как работает бот?
Ответ: - Рано утром после рестарта, запускается программа, которая забирает за вас бесплатную энергию (+60) с сайта https://wendy-shop.nexters.com.

Вопрос: Что нужно чтобы добавить себя/друга/согильдийца?
Ответ: - Прописать команду в этой группе или в личку бота: /add ID

Вопрос: Я вчера добавил id но сегодня не пришло!!!
Ответ: - Проверьте что ваш ID точно добавлен в рассылку командой /me. Если его нет в рассылке - добавьте повторно.

Вопрос: Могу ли я удалить себя из рассылки?
Ответ: - Да. Напишите @marstut в личку с такой просьбой и прикрепите скрин с вашим игровым ID.

Вопрос: Как понять что я добавлен в рассылку?
Ответ: - Просто напишите еще раз команду /me с вашим игровым ID. Например: /me 1223334444

Вопрос: Наносит ли вред данный бот работе сайта?
Ответ: -Нет. Запросы подарка происходят не чаще 1-2 раз в секунду (чисто в теории можно забирать в ручную быстрее)

Вопрос: Если выйти из группы, рассылка будет работать?
Ответ: - Да. Но мы рекомендуем быть подписаным на основной канал (https://t.me/wendy_bot_news), чтобы в случае чего быть в курсе новостей.

Вопрос: Что еще нужно знать?
Ответ: - Если вы перенесли аккаунт - ваш игровой ID изменится и нужно будет по новой его вносить в бота.

Вопрос: Как я могу вас поддержать?
Ответ: - Теперь каждый желающий может поддержать канал по ссылке: https://www.donationalerts.com/r/marstut`

const BOT_HUCK_TEXT = `Напишите id (только цифры)`;

loadSavedUsersIfExist();

const MAIN_LIST = `
    https://docs.google.com/spreadsheets/u/0/d/1Q94gtj4Puk8JWTKsFE-aKBh_irITYOI3j53eW2IHl58/export?format=csv&id=1Q94gtj4Puk8JWTKsFE-aKBh_irITYOI3j53eW2IHl58&gid=0`;
const CHECK_LIST = `
    https://docs.google.com/spreadsheets/d/1Q94gtj4Puk8JWTKsFE-aKBh_irITYOI3j53eW2IHl58/export?format=csv&id=1Q94gtj4Puk8JWTKsFE-aKBh_irITYOI3j53eW2IHl58&gid=1713670405`;



const SENDER_ID = "127705881"; // tg@marstut

let gotList = [];
let sendList = [];
let problemsList = [];

const NOBODY_TEXT = "🤷‍♂️";

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id,
    "Привет. Я бот с Wendy подарками.\nПиши '/add id' чтобы добавить аккаунт в рассылку. Например: \n/add 123456789");
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
  const isHaveInTable = !!addedUsers.find(e => +e.id === +id);
  if (isHaveInTable) {
    bot.sendMessage(msg.chat.id, "⏰ Аккаунт уже добавлен в список на рассылку.", {
      reply_to_message_id: msg.message_id,
    });
    return;
  }
  const res = await checkNameById(id);
  if (res.success) {
    if (isHaveInTable) {
      bot.sendMessage(msg.chat.id, "Такой id уже есть в рассылке", {
        reply_to_message_id: msg.message_id,
      });
      return;
    }
    bot.sendMessage(msg.chat.id, `✅⏰ ${id} добавлен в рассылку. Напоминаем что после 18 августа, подписка на https://t.me/wendy_bot_news, является обязательным условием для участия в рассылке.\n Вы можете проверить свой статус командой /metest@daily_wendy_gift_bot`, {
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
  if (!msg.text) {
    return;
  };
  if (msg.text.startsWith("/faq")) {
    bot.sendMessage(msg.chat.id, FAQ_TEXT);
    return;
  }


  if (msg.reply_to_message?.text === BOT_HUCK_TEXT) {
    adding({ ...msg, text: "/add " + msg.text?.trim() });
    // bot.sendMessage(msg.chat.id, `Напишите id (только цифры)`, {
    //   reply_to_message_id: msg.message_id,
    //   // reply_markup: {
    //   //   force_reply: true,
    //   // }
    // });

    // bot.sendMessage(msg.chat.id, `МСК (+3 utc) ${dayjs().add(3, 'hours').format("DD-MM-YYYY HH:mm:ss")} `, {
    //   reply_to_message_id: msg.message_id,
    //   reply_markup: {
    //     force_reply: true,
    //   }
    // });
    return;
  }
  console.log(msg);
  console.log(`${msg.from.username} ${msg.from.id}: ${msg.text}`);

  if (msg.text === "/metest@daily_wendy_gift_bot") {
    const id = msg.text.match(new RegExp(/[0-9].+/gm))?.[0];
    const userInTable = addedUsers.find(e => +e.id === +id);
    // if (!id) {
    //   bot.sendMessage(msg.chat.id, "🧐 Укажите ID после команды /me. Например: /me 122333444", { reply_to_message_id: msg.message_id, });
    //   return;
    // }
    const haveIDInTgChannel = await checkTgIdInChannel(msg.from.id);
    const groupTgId = groupBy(addedUsers, "tgId")[msg.from.id];
    if (haveIDInTgChannel) {
      const botMsg = `✅🎁 Все условия выполнены. У вас ${accStr(groupTgId?.length || 0)} участвуют в рассылке:\n ${groupTgId?.length ? groupTgId.map(e => e.nickname).join(", ") : "-"}`.slice(0, 4092);
      bot.sendMessage(msg.chat.id, botMsg + (botMsg.length > 4091 ? "..." : ""), {
        reply_to_message_id: msg.message_id,
      });
    } else {
      bot.sendMessage(msg.chat.id, `🚫🎁 Вы добавили ${accStr(groupTgId?.length || 0)}, но вам так же нужно подписаться на https://t.me/wendy_bot_news, чтобы получать энергию`, {
        reply_to_message_id: msg.message_id,
      });
    }

    return;
  }

  if (msg.text.startsWith("/me")) {
    const id = msg.text.match(new RegExp(/[0-9].+/gm))?.[0];
    const userInTable = addedUsers.find(e => +e.id === +id);
    if (!id) {
      bot.sendMessage(msg.chat.id, "🧐 Укажите ID после команды /me. Например: /me 122333444", { reply_to_message_id: msg.message_id, });
      return;
    }
    if (!!userInTable) {
      bot.sendMessage(msg.chat.id, `✅ Такой ID есть в рассылке под ником (${userInTable.nickname}). Рассылка запускается в 5:10 МСК ежедневно и длится в течении ` + getTime(addedUsers?.length), { reply_to_message_id: msg.message_id, });
    } else {
      bot.sendMessage(msg.chat.id, "🤷 Такого ID нет в рассылке. Чтобы добавить - нажмите:\n/add" + id, { reply_to_message_id: msg.message_id, });
    }
    return;
  }



  if (msg.text.toLowerCase().startsWith("id") || msg.text.startsWith("/Add") || msg.text.toLowerCase().startsWith("add") || msg.text.match(new RegExp(/^\d+$/))?.[0]) {
    bot.sendMessage(msg.chat.id, "Нужно указать /add и ID в одном предложении. Например:\n/add 1223334444", { reply_to_message_id: msg.message_id, });
    return;
  }

  if (canPassRole(msg, ROLES_ADMIN) && msg.text.startsWith("/run")) {
    sendTG("🎉 Бот снова начинает принимать заявки.🎉");
    isPauseBot = false;
    return;
  }
  if (canPassRole(msg, ROLES_ADMIN) && msg.text.startsWith("/stop")) {
    sendTG("🕺🏻 Бот отправлен отдыхать 💃🏻");
    isPauseBot = true;
    return;
  }

  if (canPassRole(msg, ROLES_ADMIN) && msg.text === "/jobs_run") {
    bot.sendMessage(OWNER_ID, "Запущены все джобы");

    // job send gifts 5:10 MSK
    jobGifts = schedule.scheduleJob('0 10 2 * * *', function() {
      bot.sendMessage(OWNER_ID, "[job send gifts] 5:10 MSK");
      sendGifts();
    });

    // job service СБ 10:00 MSK
    jobService = schedule.scheduleJob('0 0 7 * * 7', function() {
      bot.sendMessage(OWNER_ID, "[job service] СБ 10:00 MSK");
      checks();
    });
    return;
  }

  if (canPassRole(msg, ROLES_ADMIN) && msg.text === "/jobs_stop") {
    bot.sendMessage(msg.chat.id, "Jobs were stops");
    jobGifts?.cancel();
    jobService?.cancel();
    return;
  }


  if (isPauseBot || !msg.text) {
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

  if (canPassRole(msg, ROLES_ADMIN) && msg.text.startsWith("/backup")) {
    backup();
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

  if (msg.text.startsWith("/info")) {
    bot.sendMessage(msg.chat.id, `Основной канал - https://t.me/wendy_bot_news\n\nОбсуждение - https://t.me/daily_wendy_gifts\n⏰ В рассылке: ${addedUsers?.length || 0} аккаунтов\n/add id = Добавляет аккаунт в рассылку\nРассылка на все аккаунты займет примерно ${getTime(addedUsers?.length)}`, {
      reply_markup: JSON.stringify({
        hide_keyboard: true
      })
    });
    return;
  }
});

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

const getTime = (count, multi = STEP_DELAY) => {
  const minuts = Math.round((multi * count) / 60000);
  return minuts + minutesStr(minuts)
};

const sendGifts = async (lastCount = 0) => {
  gotList = [];
  sendList = [];
  problemsList = [];
  try {
    sendTG("🎉 Начинаем рассылать энергию на почту 🎉. В течении " + getTime(lastCount || addedUsers?.length) + " к вам на почту придет письмо с +60 энергии");
    let delay = 0;
    shuffle(addedUsers.slice(lastCount)).forEach(({ nickname: name, id }, index, arr) => {
      setTimeout(() => {
        sendGiftByID(id, name).then((result) => console.log(result));
      }, STEP_DELAY + delay);
      if (index === arr.length - 1) {
        setTimeout(() => {
          const gots = gotList.join(', ');
          const sends = sendList.join(', ');
          sendTG("⛔ Ошибки: " + (problemsList?.length || NOBODY_TEXT));
          const sendedMSG = `🐢 Отправлено ${getLabelTime()}: ${sendList?.length || 0} шт(это ${(sendList.length || 0) * 60} энергии)`;
          sendTG(sendedMSG);
          bot.sendMessage(OWNER_ID, sendedMSG);
          sendTG(`🤦‍♂️ Уже взяли бесплатную энергию: ${gotList?.length || 0} шт`);
        }, STEP_DELAY + delay + 10000);

        setTimeout(() => {
          sendTG(`🥹🥹🥹 Раздача закончилась - проверяйте почту.Вы можете добавлять согильдицев / друзей - пишите / add id\n\n Основной канал - https://t.me/wendy_bot_news\n\nПригласительная на чат - https://t.me/daily_wendy_gifts`);
        }, STEP_DELAY + delay + 15000);
      }
      delay += STEP_DELAY;
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
    sendTG(`🧑‍💻⏰ Началось плановое серверное обслуживание базы бота.\n\nПродолжительность: ${getTime(addedUsers.length, CHECK_NAME_STEP_DELAY)}\n\n Новые заявки временно не принимаются. Следите за новостями тут - https://t.me/wendy_bot_news`);
    let delay = 0;
    // if(!!msg){
    //         bot.sendMessage(msg.chat.id, `⏰ Начали чекать имена. Займет ${getTime(addedUsers.length, CHECK_NAME_STEP_DELAY)}`, { reply_to_message_id: msg.message_id });
    //      }


    shuffle(addedUsers).forEach((entity, index, arr) => {
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
          // if(!!msg){
          //    bot.sendMessage(msg.chat.id, `🚫🗑⛔ Ошибки: ${problems.map(e => `${e.id} ${e.error} ${e.nickname}`)}`, { reply_to_message_id: msg.message_id });
          // }

          const errorsNameFile = `logs/problems-${new Date().getDate()}-${new Date().getMonth()}-${new Date().getFullYear()}_${new Date().getHours()}:${new Date().getMinutes()}`;
          const newListNameFile = `logs/newlist-${new Date().getDate()}-${new Date().getMonth()}-${new Date().getFullYear()}_${new Date().getHours()}:${new Date().getMinutes()}`;
          addedUsers = updatedAddedUsers;
          fs.writeFile(errorsNameFile, JSON.stringify(problems));
          fs.writeFile(newListNameFile, JSON.stringify(updatedAddedUsers));
          fs.writeFile(USERS_PERSIST_PATH, JSON.stringify(updatedAddedUsers));

          isPauseBot = false;
          sendTG("🎉 Бот снова начинает принимать заявки.🎉");

        }, CHECK_NAME_STEP_DELAY + delay + 15000);
      }
      delay += CHECK_NAME_STEP_DELAY;
    });
  } catch (err) {
    console.log("Some Google Error ", err);
    bot.sendMessage(OWNER_ID, "[ERROR-checks]" + JSON.stringify({ err }));
  }
}