const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const token = '7901822583:AAE5HS_OwFcRf6iMUHNfQK9zkP_cIwb7TxM';
const bot = new TelegramBot(token, {polling: true});
const userStates = {};
const config = {
    proxyEnabled: false,
    proxyType: '',
    method: 1,
    webhookEnabled: false,
    webhookUrl: '',
    threads: 5,
    usernameLength: 6,
    caseType: 1,
    includeDigits: 0,
    prefix: '',
    suffix: ''
};
const mainMenuKeyboard = {
    reply_markup: {
        keyboard: [
            [{text: '⚙️ Configuration'}, {text: '▶️ Start Checker'}],
            [{text: '📊 Stats'}, {text: '🛠️ Tools'}]
        ],
        resize_keyboard: true
    }
};
const configMenuKeyboard = {
    reply_markup: {
        keyboard: [
            [{text: '🔙 Back to Main Menu'}],
            [{text: '🔄 Toggle Proxy'}, {text: '🔧 Proxy Type'}],
            [{text: '📝 Method'}, {text: '🌐 Webhook'}],
            [{text: '🧵 Threads'}, {text: '🔢 Username Length'}],
            [{text: '📝 Case Type'}, {text: '🔢 Include Digits'}],
            [{text: '🔤 Prefix/Suffix'}]
        ],
        resize_keyboard: true
    }
};
let stats = {
    availables: 0,
    takens: 0,
    invalids: 0,
    retries: 0,
    webhookRetries: 0
};
function getRandomUserAgent() {
    const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
    ];
    return userAgents[Math.floor(Math.random() * userAgents.length)];
}

function generateUsername(length, includeDigits, caseType, prefix, suffix) {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '0123456789';
    let chars = '';
    if (caseType === 1) chars = lowercase;
    else if (caseType === 2) chars = uppercase;
    else if (caseType === 3) chars = lowercase + uppercase;
    else if (caseType === 4) chars = digits;
    
    if (includeDigits === 1 && caseType !== 4) chars += digits;
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return prefix + result + suffix;
}
async function checkTikTokUsername(username, chatId) {
    try {
        const url = `https://www.tiktok.com/api/uniqueid/check/?aid=1233&unique_id=${username}`;
        
        const headers = {
            'User-Agent': getRandomUserAgent()
        };
        const response = await axios.get(url, {headers});
        const statusCode = response.data.status_code;
        
        if (statusCode === 0) {
            stats.availables++;
            bot.sendMessage(chatId, `✅ AVAILABLE: ${username}`);
            if (config.webhookEnabled) {
                await sendWebhook(username, chatId);
            }
        } else if (statusCode === 3249) {
            stats.takens++;
            bot.sendMessage(chatId, `❌ TAKEN: ${username}`);
        } else {
            stats.invalids++;
            bot.sendMessage(chatId, `⚠️ INVALID: ${username}`);
        }
    } catch (error) {
        stats.retries++;
        checkTikTokUsername(username, chatId);
    }
}
async function sendWebhook(username, chatId) {
    try {
        const timestamp = new Date().toISOString();
        const payload = {
            embeds: [{
                title: "NAMA PENGGUNA TIKTOK TERSEDIA",
                description: username,
                color: 65362,
                timestamp: timestamp
            }]
        };
        await axios.post(config.webhookUrl, payload);
        bot.sendMessage(chatId, `📢 Webhook dikirim untuk: ${username}`);
    } catch (error) {
        stats.webhookRetries++;
        sendWebhook(username, chatId);
    }
}
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    userStates[chatId] = { state: 'main' };
    bot.sendMessage(chatId, 'HACKED LORDHOZOO BAN TIKTOK 2025', mainMenuKeyboard);
});
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    
    if (!userStates[chatId]) {
        userStates[chatId] = { state: 'main' };
    }
    const userState = userStates[chatId];
    if (userState.state === 'main') {
        if (text === '⚙️ Configuration') {
            userState.state = 'config';
            bot.sendMessage(chatId, 'Configuration Menu:', configMenuKeyboard);
        } else if (text === '▶️ Start Checker') {
            startChecker(chatId);
        } else if (text === '📊 Stats') {
            showStats(chatId);
        }
    }
    else if (userState.state === 'config') {
        if (text === '🔙 Back to Main Menu') {
            userState.state = 'main';
            bot.sendMessage(chatId, 'Main Menu:', mainMenuKeyboard);
        } else if (text === '🔄 Toggle Proxy') {
            config.proxyEnabled = !config.proxyEnabled;
            bot.sendMessage(chatId, `Proxy ${config.proxyEnabled ? 'enabled' : 'disabled'}`);
        } else if (text === '🔧 Proxy Type') {
            userState.state = 'proxy_type';
            bot.sendMessage(chatId, 'Select proxy type:', {
                reply_markup: {
                    keyboard: [
                        [{text: '1 - HTTP'}, {text: '2 - SOCKS4'}],
                        [{text: '3 - SOCKS5'}, {text: '🔙 Back'}]
                    ],
                    resize_keyboard: true
                }
            });
        }
    }
    else if (userState.state === 'proxy_type') {
        if (text === '1 - HTTP') {
            config.proxyType = 'http';
            bot.sendMessage(chatId, 'HTTP proxy selected');
        } else if (text === '2 - SOCKS4') {
            config.proxyType = 'socks4';
            bot.sendMessage(chatId, 'SOCKS4 proxy selected');
        } else if (text === '3 - SOCKS5') {
            config.proxyType = 'socks5';
            bot.sendMessage(chatId, 'SOCKS5 proxy selected');
        } else if (text === '🔙 Back') {
            userState.state = 'config';
            bot.sendMessage(chatId, 'Configuration Menu:', configMenuKeyboard);
        }
    }
});
function startChecker(chatId) {
    bot.sendMessage(chatId, '🚀 Starting TikTok username checker...');
    if (config.method === 1) {
        for (let i = 0; i < config.threads; i++) {
            const username = generateUsername(
                config.usernameLength,
                config.includeDigits,
                config.caseType,
                config.prefix,
                config.suffix
            );
            checkTikTokUsername(username, chatId);
        }
    } else {
        fs.readFile('usernames.txt', 'utf8', (err, data) => {
            if (err) {
                bot.sendMessage(chatId, 'Error reading usernames.txt');
                return;
            }
            const usernames = data.split('\n');
            for (let i = 0; i < Math.min(config.threads, usernames.length); i++) {
                checkTikTokUsername(usernames[i], chatId);
            }
        });
    }
}
function showStats(chatId) {
    const message = `📊 Stats:
✅ Available: ${stats.availables}
❌ Taken: ${stats.takens}
⚠️ Invalid: ${stats.invalids}
🔄 Retries: ${stats.retries}
🌐 Webhook Retries: ${stats.webhookRetries}`;
    bot.sendMessage(chatId, message);
}
console.log('Bot is running...');
