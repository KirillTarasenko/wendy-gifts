const { parse } = require("csv-parse");
const { shuffle, uniqBy } = require("lodash");
const { instance } = require("./api");
const path = require('path');
const { groupBy } = require('lodash');
const fs = require('fs').promises;
const { checkNameById } = require("./utils");
const { bot, sendTG, checkId } = require("./tg-bot");
const { Telegraf } = require('telegraf');
const DATA = require('./test.json');


let addedUsers = [];
let isPauseBot = false;

const waiter = (delayMS = 0) => new Promise(resolve => setTimeout(resolve, delayMS));




const a = groupBy(DATA, "tgId");
const d = Object.entries(a).map(([key, value]) => ({ key, len: value?.length })).sort((a, b) => b.len - a.len).slice(1);
console.log("a", d.reduce((acc, cur) => {
  acc += cur.len;
  return acc;
}, 0) / d.length)


// const sendList = 
let delay = 0;
let validTgs = [];
d.forEach((d, i) => {

  setTimeout(async () => {
    const haveId = await checkId(d.key);
    if (haveId) {
      validTgs.push(d.key);
    }
    if (i === d.length - 2) {
      console.log("====>",validTgs);
  }
    console.log(i, d.key, haveId);
    
  }, delay)
  delay += 50;
});

// while (true){

// }




// { key: '1134472671', len: 49 },
// { key: '1787744212', len: 46 },
// { key: '1239761526', len: 33 },
// { key: '841333731', len: 28 },
// { key: '5016733605', len: 27 },
// { key: '5157330414', len: 27 },
// { key: '1758482557', len: 26 },
// { key: '1102009343', len: 23 },
// { key: '5162438869', len: 23 },
// { key: '2009770974', len: 22 },
// { key: '1166951550', len: 21 },
// checkId(1134472671);
// checkId(1787744212);
// checkId(1239761526);
// checkId(5016733605);
// checkId(5157330414);
// checkId(1758482557);
// checkId(1102009343);
// checkId(985612311);
// checkId(985612311);
// checkId(985612311);

// botNew.start((ctx) => {
//   ctx.reply('Welcome');
//   // ctx.telegram.getChatMember(-1001959220092, 457980948).then(e=>{
//   //   console.log("===>", e)
//   // })
// });
// botNew.start((ctx) => {
//   ctx.reply('Welcome');
// ctx.telegram.getChatMember(-1001959220092, 457980948).then(e=>{
//     console.log("===>", e)
//   })
// });
// botNew.help((ctx) => ctx.reply('Send me a sticker'));
// // botNew.on(message('sticker'), (ctx) => ctx.reply('👍'));
// botNew.hears('hi', (ctx) => ctx.reply('Hey there'));
// botNew.launch();

// const call = () =>{
// console.log("f");
// console.log("===>", botNew, ctx.telegram)



// };

// call();


// const USERS_PERSIST_PATH = path.join(process.cwd(), 'users.json');

// async function loadSavedUsersIfExist() {
//   try {
//     const content = await fs.readFile(USERS_PERSIST_PATH);
//     addedUsers = uniqBy(JSON.parse(content), 'id');
//   } catch (err) {
//     console.log("=>", err);
//     return null;
//   }
// }
// console.log("Start bot");

// loadSavedUsersIfExist();

// const MAIN_LIST = `
//     https://docs.google.com/spreadsheets/u/0/d/1Q94gtj4Puk8JWTKsFE-aKBh_irITYOI3j53eW2IHl58/export?format=csv&id=1Q94gtj4Puk8JWTKsFE-aKBh_irITYOI3j53eW2IHl58&gid=0`;
// const CHECK_LIST = `
//     https://docs.google.com/spreadsheets/d/1Q94gtj4Puk8JWTKsFE-aKBh_irITYOI3j53eW2IHl58/export?format=csv&id=1Q94gtj4Puk8JWTKsFE-aKBh_irITYOI3j53eW2IHl58&gid=1713670405`;

//     const OWNER_ID = 457980948;

// const STEP_DELAY = 800;

// const SENDER_ID = "127705881"; // tg@marstut

// const gotList = [];
// const sendList = [];
// const problemsList = [];

// const NOBODY_TEXT = "🤷‍♂️";

// bot.onText(/\/start/, (msg) => {
//   bot.sendMessage(msg.chat.id,
//     "Привет. Я бот с Wendy подарками.\nПиши '/add id' чтобы добавить аккаунт в рассылку. Например: \n/add 123456789");
// });


// bot.onText(/\/add/, async (msg) => {

//   const id = msg.text.match(new RegExp(/[0-9].+/gm))?.[0];
//   if (!id) {
//     bot.sendMessage(msg.chat.id, "Не указан id");
//     return;
//   }
//   if (addedUsers.find(e => e.id === id)) {
//     bot.sendMessage(msg.chat.id, "⏰ Аккаунт уже добавлен в список на расслылку. Ждем когда его добавят в общую таблицу", { reply_to_message_id: msg.message_id });
//     return;
//   }
//   const res = await checkNameById(id);
//   if (res.success) {
// const isHaveInTable = await checkConsist(id);
//     if (isHaveInTable) {
//       bot.sendMessage(msg.chat.id, "Такой id уже есть в рассылке");
//       return;
//     }
//     bot.sendMessage(msg.chat.id, `✅⏰ ${id} добавлен на модерацию.`);
//     addedUsers.push({ nickname: res.nickname, id });
//     fs.writeFile(USERS_PERSIST_PATH, JSON.stringify(addedUsers));
//     console.log("➕ " + res.nickname + " " + id);
//   } else {
//     bot.sendMessage(msg.chat.id, res.error);
//   }
// });

// bot.on("message", async (msg) => {
//   if(!msg.text){
//     return;
//   };
//   if (msg.from.id === OWNER_ID && msg.text.startsWith("/run")) {
//     sendTG("🎉 Бот снова начинает принимать заявки.  🎉");
//     isPauseBot = false;
//     return;
//   }
//   if (msg.from.id === OWNER_ID && msg.text.startsWith("/stop")) {
//     sendTG("🕺🏻 Бот отправлен отдыхать 💃🏻");
//     isPauseBot = true;
//     return;
//   }
//   if (isPauseBot || !msg.text) {
//     return;
//   }

//   if (msg.from.id === OWNER_ID && msg.text.startsWith("/gifts")) {
//     sendGifts();
//     return;
//   }
//   if (msg.from.id === OWNER_ID && msg.text.startsWith("/print")) {
//     await loadSavedUsersIfExist();
//     bot.sendMessage(msg.chat.id, "Добавить:\n" + addedUsers.map(e => `${e.nickname} ${e.id}`).join("\n"));
//     return;
//   }

//   if (msg.text.toLowerCase().startsWith("штрав")) {
//     bot.sendMessage(msg.chat.id, "Только @marstut может такое писать.", {
//       reply_to_message_id: msg.message_id,
//     });
//     return;
//   }

//   if (msg.text.startsWith("/info")) {
//     bot.sendMessage(msg.chat.id, `⏰ В ожидании: ${addedUsers?.length || 0}\n/add id = Добавляет аккаунт в рассылку\n`, {
//       reply_markup: JSON.stringify({
//         hide_keyboard: true
//     })
//     });
//     return;
//   }
// });

// const call = async () => {
//   let isConsist = false;
//   const res = await fetch(MAIN_LIST, {
//     method: "get",
//     headers: {
//       "content-type": "text/csv;charset=UTF-8",
//     },
//   });
// console.log("==>", res)
//   if (res.status === 200) {
//     const data = await res.text();
//     parse(data, { columns: false, trim: true }, function (err, rows) {
//       const rowsNew = rows.map(([name, id])=> ({nickname: name, id}));
//       addedUsers = uniqBy([...rowsNew, ...addedUsers], 'id');
//       console.log("{addedUsers}", addedUsers);
//       fs.writeFile(USERS_PERSIST_PATH, JSON.stringify(addedUsers));
//     });
//   }
// }

// // const sendGiftByID = (id, nick) =>
// //   instance
// //     .post("bundles/free_energy/buy?filters[locale]=ru", {
// //       data: {
// //         platform_buyer_id: SENDER_ID,
// //         platform_recipient_id: "" + id,

// //       },
// //     })
// //     .then(() => {
// //       sendList.push(`${nick} (${id})`);
// //       return "[✅ Отправлено " + nick + " with id: (" + id + ")]";
// //     })
// //     .catch((error) => {
// //       const isGot = error.response?.data?.errors?.[0]?.status === "422";
// //       if (isGot) {
// //         gotList.push(`${nick} (${id})`);
// //       } else {
// //         problemsList.push(`${nick} (${id})`);
// //       }
// //       return (
// //         (isGot
// //           ? "[🤦‍♂️ Уже брал "
// //           : "[🚫 Ошибка ") +
// //         nick +
// //         " with id: (" +
// //         id +
// //         ")] " +
// //         (isGot ? "" : JSON.stringify(error.response?.data))
// //       );
// //     });

// // const sendGifts = async () => {
// //   try {

// //     const res = await fetch(MAIN_LIST, {
// //       method: "get",
// //       headers: {
// //         "content-type": "text/csv;charset=UTF-8",
// //       },
// //     });

// //     if (res.status === 200) {
// //       const data = await res.text();
// //       sendTG("🎉 Начинаем раздавать подарки 🎉");
// //       console.log("🥳 Success download Gifts.csv");
// //       parse(data, { columns: false, trim: true }, function (err, rows) {
// //         let delay = 0;
// //         shuffle(rows).forEach(([name, id], index, arr) => {
// //           setTimeout(() => {
// //             sendGiftByID(+id, name).then((result) => console.log(result));

// //           }, STEP_DELAY + delay);
// //           if (index === arr.length - 1) {
// //             setTimeout(() => {
// //               const gots = gotList.join(', ');
// //               const sends = sendList.join(', ');
// //               const problems = problemsList.join(', ');
// //               if (sendList?.length) {
// //                 for (let i = 0; i < Math.floor(sendList.length / 100) + 1; i++) {
// //                   sendTG("🐢 Получили: " + (sendList.slice(i * 100, i * 100 + 100).join(', ')));
// //                 }
// //               }

// //               sendTG("⛔ Ошибки: " + (problems?.length ? problems : NOBODY_TEXT));
// //               sendTG(`🐢 Отправлено: ${sendList?.length || 0} шт (это ${(sendList.length || 0) * 60} энергии)`);
// //               sendTG(`🤦‍♂️ Уже взяли бесплатную энергию: ${gotList?.length || 0} шт`);


// //               console.log("🤨 Уже взяли: ", gots);
// //               console.log("🐢 Получили: ", sends);
// //               console.log("⛔ Ошибки: ", problems);
// //             }, STEP_DELAY + delay + 10000);

// //             setTimeout(() => {
// //               sendTG(`🥹🥹🥹 Раздача закончилась - проверяйте почту. Вы можете добавлять согильдицев/друзей - пишите id и ник`);
// //             }, STEP_DELAY + delay + 15000);
// //           }
// //           delay += STEP_DELAY;
// //         });
// //       });
// //     } else {
// //       console.log(`Download Error code ${res.status}`);
// //     }
// //   } catch (err) {
// //     console.log("Some Google Error ", err);
// //   }
// // };
// call();
