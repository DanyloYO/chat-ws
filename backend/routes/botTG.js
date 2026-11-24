const { Telegram, Keyboard } = require("puregram")
const config = require("../config")
const { InlineKeyboard } = require("puregram")

const bot = Telegram.fromToken(config.bot_token)
bot.updates.on('callback_query', checkTG)

async function sendTG(user) {
    await bot.api.sendMessage({
        chat_id: config.admin_chat,
        text: 
`
<b>📥 Новый пользователь</b>

<b>👤 ${user}</b>`,
               parse_mode: "HTML",
    })
}
async function checkTG(query) {
    const action = query.queryPayload.split("|")[0]
    const user = query.queryPayload.split("|")[1]
    if(action == "accept"){
        return {ok: true, name:user}
    }
    if(action == "reject"){
        return {ok: false, name:user}
    }
}
bot.updates
    .startPolling()
    .then(() =>
        console.log(`[Bot] - @${bot.bot.username} | Started!`)
    );

module.exports = sendTG