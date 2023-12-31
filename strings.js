
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
Ответ: - Нет. Энергия приходит только на аккаунты добавленные пользователем, который подписан на https://t.me/wendy_bot_news. 

Вопрос: Что еще нужно знать?
Ответ: - Если вы перенесли аккаунт - ваш игровой ID изменится и нужно будет по новой его вносить в бота.

Вопрос: Как я могу вас поддержать?
Ответ: - Теперь каждый желающий может поддержать канал по ссылке: https://www.donationalerts.com/r/marstut`

const BOT_HUCK_TEXT = `Напишите id (только цифры)`;

module.exports = { FAQ_TEXT, BOT_HUCK_TEXT }