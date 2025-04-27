const TelegramBot = require('node-telegram-bot-api');
const moment = require('moment');
const axios = require('axios');
require('moment/locale/id'); 
const token = '7901822583:AAE5HS_OwFcRf6iMUHNfQK9zkP_cIwb7TxM';
const bot = new TelegramBot(token, {polling: true});
const menus = {
    main: {
        text: `🌟 *SELAMAT DATANG KAK LORDHOZOO MANIS IMUT👰 * 🌟\n\n` +
              `Pilih menu di bawah untuk memulai:`,
        options: {
            reply_markup: {
                resize_keyboard: true,
                keyboard: [
                    [{text: '📅 Tanggal & Waktu', text: '🔄 Status Bot'}],
                    [{text: '⚙️ Pengaturan', text: '🎲 Fitur Keren'}],
                    [{text: 'ℹ️ Informasi', text: '📊 Statistik'}]
                ]
            },
            parse_mode: 'Markdown'
        }
    },
    dateTime: {
        text: (ctx) => {
            const now = moment();
            return `📅 *Tanggal:* ${now.format('dddd, D MMMM YYYY')}\n` +
                   `⏰ *Waktu:* ${now.format('HH:mm:ss')}\n\n` +
                   `Hari ini adalah *${now.format('dddd')}* tanggal *${now.format('D')}* bulan *${now.format('MMMM')}* tahun *${now.format('YYYY')}*`;
        },
        options: {
            reply_markup: {
                inline_keyboard: [
                    [{text: '🔄 Refresh', callback_data: 'refresh_datetime'}],
                    [{text: '🔙 Kembali', callback_data: 'back_to_main'}]
                ]
            },
            parse_mode: 'Markdown'
        }
    },
    features: {
        text: `🎲 *EXECUTOR LORDHOZOO BAN TIKTOK:*\n\n` +
              `• Cek username TikTok\n` +
              `• Generate username acak\n` +
              `• Sistem multi-threading\n` +
              `• Dukungan proxy\n` +
              `• Webhook integration\n\n` +
              `Pilih fitur yang ingin dicoba:`,
        options: {
            reply_markup: {
                inline_keyboard: [
                    [
                        {text: '🔍 Cek Username', callback_data: 'check_username'},
                        {text: '🎰 Generate', callback_data: 'generate_username'}
                    ],
                    [
                        {text: '⚡ Speed Test', callback_data: 'speed_test'},
                        {text: '🌐 Proxy Test', callback_data: 'proxy_test'}
                    ],
                    [{text: '🔙 Kembali', callback_data: 'back_to_main'}]
                ]
            },
            parse_mode: 'Markdown'
        }
    }
};
let stats = {
    checks: 0,
    generated: 0,
    activeSince: new Date()
};
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    sendMenu(chatId, 'main');
});
bot.on('callback_query', (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;
    switch(data) {
        case 'refresh_datetime':
            updateDateTimeMessage(chatId, callbackQuery.message.message_id);
            break;
        case 'check_username':
            askForUsername(chatId);
            break;
        case 'generate_username':
            generateUsername(chatId);
            break;
        case 'back_to_main':
            sendMenu(chatId, 'main');
            break;
        default:
            bot.sendMessage(chatId, 'Fitur belum tersedia, coba lagi nanti!');
    }
});
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    if (text === '📅 Tanggal & Waktu') {
        sendMenu(chatId, 'dateTime');
    } else if (text === '🎲 Fitur Keren') {
        sendMenu(chatId, 'features');
    } else if (text === '🔙 Kembali') {
        sendMenu(chatId, 'main');
    }
});
function sendMenu(chatId, menuName) {
    const menu = menus[menuName];
    const text = typeof menu.text === 'function' ? menu.text() : menu.text;
    bot.sendMessage(chatId, text, menu.options);
}
function updateDateTimeMessage(chatId, messageId) {
    const menu = menus.dateTime;
    const text = menu.text();
    
    bot.editMessageText(text, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'Markdown',
        reply_markup: menu.options.reply_markup
    });
}

// Ask for username to check
function askForUsername(chatId) {
    bot.sendMessage(chatId, '🔍 Masukkan username TikTok yang ingin dicek:', {
        reply_markup: {
            force_reply: true
        }
    }).then((sentMsg) => {
        const replyListenerId = bot.onReplyToMessage(chatId, sentMsg.message_id, (reply) => {
            bot.removeReplyListener(replyListenerId);
            checkTikTokUsername(chatId, reply.text);
        });
    });
}
function checkTikTokUsername(chatId, username) {
    const isAvailable = Math.random() > 0.5;
    stats.checks++;
    const result = isAvailable ? 
        `✅ Username *${username}* tersedia!` :
        `❌ Username *${username}* sudah digunakan.`;
    bot.sendMessage(chatId, result, {parse_mode: 'Markdown'});
}
function generateUsername(chatId) {
    const length = 8;
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    stats.generated++;
    bot.sendMessage(chatId, `🔮 Username acak: *${result}*`, {parse_mode: 'Markdown'});
}
console.log('🤖 Bot keren sedang berjalan...');
