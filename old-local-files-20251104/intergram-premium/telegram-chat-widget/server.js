const request = require('request');
const compression = require('compression');
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const geoip = require('geoip-lite');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const serverLink = process.env.SERVER_URL;

app.use(express.static(__dirname + '/static'));
app.use(bodyParser.json());
app.use(cors());

const users = [];
const chats = [];

const defaultOnlineState = true;

// handle admin Telegram messages
app.post('/hook', function (req, res) {
        try {

                if (!req.body.callback_query) {
                        const message = req.body.message || req.body.channel_post;
                        const chatId = message.chat.id;
                        const name = message.from.first_name || message.chat.title || 'admin';
                        const text = message.text || '';
                        const reply = message.reply_to_message;

                        console.log('< ' + text)

                        if (text.startsWith('/start')) {
                                console.log('/start chatId ' + chatId);
                                sendTelegramMessage(chatId,
                                        '*Welcome to Telegram Chat Widget Bot* 🔥\n\n' +
                                        'Your unique chat id is `' + chatId + '`\n' +
                                        'Use it to link between the embedded chat and this telegram chat\n\n' +

                                        '🔹 Works on any MikroTik Hotspot Portals\n' +
                                        '🔹 Easy access for customer support\n' +
                                        '🔹 Real-time chats\n' +
                                        '🔹 Instant support and troubleshooting\n' +
                                        '🔹 Personalized interaction with your chat ID\n\n' +

                                        '*Available Commands:*\n' +
                                        '`/start` - Info about @MikrotikHsSupportBot \n' +
                                        '`/all [any_text]` - Send message to all online users\n' +
                                        '`/who` -  Get online users list\n' +
                                        '`/online` - Set chat online (Show Chat Widget)\n' +
                                        '`/offline` - Set chat offline (Hide Chat Widget)\n' +
                                        '`/ban [name]` - Ban user\n' +
                                        '`/unban [name]` - Unban user\n' +
                                        '`/user [name]` - See the user\'s information\n' +
                                        '`/info` - more information about @MikrotikHsSupportBot\n' +
                                        '`/help` - For detailed instructions\n\n' +

                                        '[Kintoyyy/Telegram-Chat-Widget](https://github.com/Kintoyyy/Telegram-Chat-Widget)Consider giving it a ⭐',
                                        'Markdown');
                        }

                        if (text.startsWith('/help')) {
                                console.log('/help chatId ' + chatId);
                                sendTelegramMessage(chatId,
                                        '*Telegram Chat Widget Bot instructions* 🔥🤖\n\n' +
                                        'Your unique chat id is `' + chatId + '`\n\n' +

                                        '*How to Setup on mikrotik:*\n\n' +
                                        '*1.)* We need to add @MikrotikHsSupportBot to hotspot walled-garden by pasting this following command in the *terminal*\n\n' +
                                        'goto:  *ip* > *hotspot* > *Walled Garden Ip List*\n\n' +
                                        'then add a new entry\nset to *accept*\nDst. Host `' + serverLink + '`\n\n' +
                                        '2. Add this in your preferred *html file* ex: *login.html*\n\n' +
                                        '```\n<script>\n' +
                                        'window.intergramId = "' + chatId + '";\n' +
                                        'window.CustomData = {\n' +
                                        '       "username": "$(username)",\n' +
                                        '       "ip address": "$(ip)",\n' +
                                        '       "Mac address": "$(mac)",\n' +
                                        '       "trial": "$(trial)",\n' +
                                        '       "interface" : "$(interface-name)",\n' +
                                        '       "vlan" : "$(vlan-id)"\n' +
                                        '};\n' +
                                        '</script>\n' +
                                        '<script id="intergram" type="text/javascript" src="' + serverLink + '/js/widget.js"></script>\n' +
                                        '```\n' +
                                        '3. *Done*\n\n' +
                                        'for more details: [Kintoyyy/Telegram-Chat-Widget](https://github.com/Kintoyyy/Telegram-Chat-Widget)\n\n' +
                                        '*Feel free to support this project*\n' +
                                        '*Paypal* - paypal.me/Kintoyyyy\n' +
                                        '*Gcash / Maya - * `09760009422`\n',
                                        'Markdown');
                        }

                        if (text.startsWith('/info')) {
                                console.log('/info chatId ' + chatId);
                                sendTelegramMessage(chatId,
                                        '*Telegram Chat Widget Bot information* 🔥[🐈](https://media.tenor.com/gTrQ1V5mSxQAAAAC/cat-call-center.gif)\n\n' +
                                        '@MikrotikHsSupportBot / [Kintoyyy/Telegram-Chat-Widget](https://github.com/Kintoyyy/Telegram-Chat-Widget) is a fork of [idoco/intergram](https://github.com/idoco/intergram) and [yamaha252/intergram](https://github.com/yamaha252/intergram) Consider giving the repositories a ⭐ to show some support\n\n' +
                                        'If you encounter some errors or you want new features\n' +
                                        'open a pull request in [Kintoyyy/Telegram-Chat-Widget](https://github.com/Kintoyyy/Telegram-Chat-Widget/pulls) 🙂\n\n' +
                                        '*Feel free to support this project*\n' +
                                        '*Paypal* - paypal.me/Kintoyyyy\n' +
                                        '*Gcash / Maya - * `09760009422`\n',
                                        'Markdown');
                        }


                        if (text.startsWith('/who')) {

                                console.log('/who');
                                const usersOnline = users.filter(user => user.chatId === chatId && user.online);
                                if (usersOnline.length) {
                                        sendTelegramMessage(chatId,
                                                '*Online users* 🧑‍🦯\n' +
                                                usersOnline.map(user => '- `' + user.userId + '`').join('\n'),
                                                'Markdown');
                                } else {
                                        sendTelegramMessage(chatId, 'No users online 🌵');
                                }

                        }

                        if (text.startsWith('/online')) {
                                console.log('/online chatId ' + chatId);
                                const chatIndex = chats.findIndex(chat => chat.chatId === chatId);
                                if (chats[chatIndex]) {
                                        chats[chatIndex].online = true;
                                } else {
                                        chats.push({
                                                chatId: chatId,
                                                online: true
                                        })
                                }
                                sendTelegramMessage(chatId, 'Your chat is *online* 🟢 now and it will be shown for new users', 'Markdown');
                        }

                        if (text.startsWith('/offline')) {
                                console.log('/offline chatId ' + chatId);
                                const chatIndex = chats.findIndex(chat => chat.chatId === chatId);
                                if (chats[chatIndex]) {
                                        chats[chatIndex].online = false;
                                } else {
                                        chats.push({
                                                chatId: chatId,
                                                online: false
                                        })
                                }
                                sendTelegramMessage(chatId, 'Your chat is *offline* 🔴 now and it won\'t be shown for new users', 'Markdown');
                        }

                        if (text.startsWith('/all')) {
                                const message = text.replace(/^\/all(@?\w+)? /, '');
                                console.log('/all ' + message);
                                io.emit(chatId, {
                                        name: name,
                                        text: message,
                                        from: 'admin',
                                });
                        }

                        if (text.startsWith('/ban')) {
                                const userId = text.replace(/^\/ban(@?\w+)? /, '');

                                if (userId === '') {
                                        sendTelegramMessage(chatId, 'Please enter a username ex.`/ban cat`', 'Markdown');
                                }

                                const userIndex = users.findIndex(user => user.userId === userId && user.chatId === chatId);
                                if (users[userIndex]) {
                                        users[userIndex].banned = true;
                                        sendTelegramMessage(chatId, 'Ok, *' + userId + '* was banned ⛔', 'Markdown');
                                } else {
                                        sendTelegramMessage(chatId, 'User not found or banned.', 'Markdown');
                                }
                        }

                        if (text.startsWith('/unban')) {
                                const userId = text.replace(/^\/unban(@?\w+)? /, '').trim();
                                const userIndex = users.findIndex(user => user.userId === userId && user.chatId === chatId);
                                if (userIndex !== -1) {
                                        users[userIndex].banned = false;
                                        sendTelegramMessage(chatId, 'Ok, *' + userId + '* was unbanned 🥳', 'Markdown');
                                } else {
                                        sendTelegramMessage(chatId, 'User not found or not banned.', 'Markdown');
                                }
                        }


                        if (text.startsWith('/user')) {
                                const userId = text.replace(/^\/user(@?\w+)? /, '');
                                const user = users.find(user => user.userId === userId && user.chatId === chatId);
                                if (user) {
                                        const CustomData = user.CustomData || {};
                                        const username = user.CustomData.username || userId;
                                        const CustomMsg = `\`${username}\`\n\n${Object.entries(CustomData).map(([label, value]) => `${label.trim()} : \`${value.trim()}\``).join('\n')}`;
                                        sendTelegramMessage(chatId, CustomMsg, 'Markdown');
                                } else {
                                        sendTelegramMessage(chatId, 'User not found', 'Markdown');
                                }
                        }

                        if (text.startsWith('/test')) {
                                const inlineKeyboard = [
                                        [
                                                { text: 'Button 1', callback_data: 'button_1' },
                                                { text: 'Button 2', callback_data: 'button_2' },
                                        ],
                                        [
                                                { text: 'Button 3', callback_data: 'button_3' },
                                                { text: 'Button 4', callback_data: 'button_4' },
                                        ],
                                        [
                                                { text: 'Button 5', callback_data: 'button_5' },
                                        ],
                                ];
                                sendTelegramMessage(
                                        chatId,
                                        'What todo with the user?🔥\n\n',
                                        'Markdown',
                                        false,
                                        inlineKeyboard
                                );
                        }

                        // Forum topic mesajları için - topic başlığı userId'dir
                        if (message.message_thread_id && message.is_topic_message) {
                                const topicId = message.message_thread_id;

                                // Topic başlığını almak için N8N'e istek at veya database'den bul
                                // Basit çözüm: Topic başlığı = userId (N8N'de createForumTopic'te name olarak userId veriyoruz)
                                // Mesajın topic'inde hangi userId olduğunu bulmak için users array'inde topicId tutmalıyız

                                // Şimdilik tüm kullanıcılara broadcast yapalım ve log'lara bakalım
                                console.log('Forum topic message received:', {
                                        topic_id: topicId,
                                        text: text,
                                        chat_id: chatId,
                                        message: JSON.stringify(message, null, 2)
                                });

                                // Her topic için userId mapping tutmalıyız - şimdilik basit: topic_name = userId
                                // Bu N8N workflow'unda topic create ederken name = userId olarak ayarlandı
                                // Telegram API'den topic bilgisi al
                                const userId = users.find(u => u.chatId === chatId && u.topicId === topicId)?.userId;

                                if (userId) {
                                        const userIndex = users.findIndex(user => user.userId === userId && user.chatId === chatId);
                                        console.log('Sending to user:', userId);

                                        if (users[userIndex]) {
                                                if (users[userIndex].online) {
                                                        io.emit(chatId + '-' + userId, { name, text, from: 'admin' });
                                                } else {
                                                        users[userIndex].messages.push({
                                                                name: name,
                                                                text: text,
                                                                time: new Date,
                                                                from: 'admin',
                                                        });
                                                }
                                        }
                                } else {
                                        console.log('User not found for topic_id:', topicId);
                                        // Tüm mesajı log'la ki debug yapabilelim
                                }
                        }
                        // Normal reply mesajları (eski sistem)
                        else if (reply && text) {
                                const replyText = reply.text || '';
                                const userId = replyText.split(':')[0];
                                const userIndex = users.findIndex(user => user.userId === userId && user.chatId === chatId);

                                console.log('Reply to user:', userId)

                                if (users[userIndex]) {
                                        if (users[userIndex].online) {
                                                io.emit(chatId + '-' + userId, { name, text, from: 'admin' });
                                        } else {
                                                users[userIndex].messages.push({
                                                        name: name,
                                                        text: text,
                                                        time: new Date,
                                                        from: 'admin',
                                                });
                                        }
                                }
                        }

                } else {
                        const callbackQuery = req.body.callback_query;
                        console.log(callbackQuery)
                        const chatId = callbackQuery.message.chat.id;
                        const data = callbackQuery.data;

                        switch (data) {
                                case 'button_1':
                                        sendTelegramMessage(chatId, 'You clicked Button 1!');
                                        break;
                                case 'button_2':
                                        sendTelegramMessage(chatId, 'You clicked Button 2!');
                                        break;
                                default:
                                        break;
                        }

                        // Respond to the callback query to acknowledge receipt
                        request.post('https://api.telegram.org/bot' + process.env.TELEGRAM_TOKEN + '/answerCallbackQuery')
                                .form({
                                        callback_query_id: callbackQuery.id,
                                })
                                .on('response', function (response) {
                                        console.log('telegram callback response:', response.statusCode);
                                });
                }

        } catch (e) {
                console.error('hook error', e, req.body);
        }
        res.statusCode = 200;
        res.end();
});

// n8n'den gelen cevapları kullanıcıya ilet
app.post('/send-to-user', function (req, res) {
        try {
                const { userId, chatId, message, from, topicId } = req.body;

                console.log('n8n response > ' + message);

                // TopicId varsa user'a kaydet (human mode için)
                if (topicId) {
                        const userIndex = users.findIndex(user => user.userId === userId && user.chatId === chatId);
                        if (userIndex !== -1) {
                                users[userIndex].topicId = topicId;
                                console.log('Saved topicId', topicId, 'for user', userId);
                        }
                }

                io.emit(chatId + '-' + userId, {
                        text: message,
                        from: from || 'bot',
                        name: 'AI Assistant'
                });

                res.statusCode = 200;
                res.json({ success: true });
        } catch (e) {
                console.error('send-to-user error', e);
                res.statusCode = 500;
                res.json({ success: false, error: e.message });
        }
});

// handle chat visitors websocket messages
io.on('connection', function (client) {

        // Kullanıcının gerçek IP adresini al (Cloudflare header'larından)
        const realIp = client.handshake.headers['cf-connecting-ip'] ||
                       client.handshake.headers['x-forwarded-for']?.split(',')[0] ||
                       client.handshake.headers['x-real-ip'] ||
                       client.handshake.address;

        // GeoIP ile lokasyon bilgisini al
        const geo = geoip.lookup(realIp);
        const country = geo?.country || '';
        const city = geo?.city || '';
        const region = geo?.region || '';
        const timezone = geo?.timezone || '';
        const coordinates = geo?.ll || [];

        console.log('Client connected from IP:', realIp, 'Country:', country, 'City:', city);

        client.on('register', function (registerMsg) {

                const userId = registerMsg.userId;
                const chatId = parseInt(registerMsg.chatId);
                const CustomData = registerMsg.CustomData;

//                 console.log('useId ' + userId + ' connected to chatId ' + chatId);

//                 const CustomMsg = `\`${userId}\`: *connected to chat* 😶‍🌫️\n\n`;
                const CustomMsg = "";
                let CustomMsgData = '';

                if (CustomData) {
                        CustomMsgData = `${Object.entries(CustomData).map(([label, value]) => `${label}: ${value}`).join('\n')}`;
                }

                sendTelegramMessage(chatId, `${CustomMsgData}`, 'Markdown', true);


                const userIndex = users.findIndex(user => user.userId === userId && user.chatId === chatId);
                if (users[userIndex]) {
                        if (users[userIndex].banned) {
                                client.disconnect();
                                return;
                        }

                        users[userIndex].online = true;
                        users[userIndex].realIp = realIp;
                        users[userIndex].country = country;
                        users[userIndex].city = city;
                        users[userIndex].region = region;
                        users[userIndex].timezone = timezone;
                        users[userIndex].coordinates = coordinates;
                        users[userIndex].messages.forEach(message => io.emit(chatId + '-' + userId, message));
                        users[userIndex].messages = [];
                        if (users[userIndex].active) {
//                                 sendTelegramMessage(chatId, '`' + userId + '` has come back 👋', 'Markdown', true);
                        }
                }

                client.on('message', function (msg) {

                        const userIndex = users.findIndex(user => user.userId === userId && user.chatId === chatId);
                        if (users[userIndex] && users[userIndex].banned) {
                                client.disconnect();
                                return;
                        }
                        io.emit(chatId + '-' + userId, msg);

                        console.log('> ' + msg.text)

                        if (msg.text === '/help') {
                                io.emit(chatId + '-' + userId, {
                                        text: registerMsg.helpMsg || 'help is coming😭',
                                        from: 'admin',
                                });
                                return;
                        }

                        let visitorName = msg.visitorName ? '[' + msg.visitorName + ']: ' : '';

                        // n8n webhook'una mesajı gönder
                        const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
                        if (n8nWebhookUrl) {
                                // Premium chat için human_mode default true, normal chat için false
                                // Frontend'den gelen değer varsa onu kullan, yoksa default'u kullan
                                const humanMode = msg.human_mode !== undefined ? msg.human_mode : true;

                                // User'ın human_mode tercihini sakla
                                if (users[userIndex]) {
                                        users[userIndex].human_mode = humanMode;
                                }

                                const messageSource = msg.messageSource || (humanMode ? 'live_support' : 'ai_bot');
                                console.log('> Sending to N8N - human_mode:', humanMode, 'messageSource:', messageSource);

                                request.post(n8nWebhookUrl, {
                                        json: {
                                                userId: userId,
                                                chatId: chatId,
                                                message: msg.text,
                                                human_mode: humanMode,
                                                messageSource: messageSource,
                                                visitorName: msg.visitorName || '',
                                                pageUrl: msg.pageUrl || '',
                                                pageTitle: msg.pageTitle || '',
                                                referrer: msg.referrer || '',
                                                userAgent: msg.userAgent || '',
                                                browserLang: msg.browserLang || '',
                                                timestamp: msg.timestamp || new Date().toISOString(),
                                                realIp: realIp,
                                                country: country,
                                                city: city,
                                                region: region,
                                                timezone: timezone,
                                                coordinates: coordinates
                                        }
                                }, function(error, response, body) {
                                        if (error) {
                                                console.log('n8n webhook error:', error);
                                                // Hata olursa Telegram'a gönder
                                                sendTelegramMessage(chatId, '`' + userId + '`:' + visitorName + ' ' + msg.text, 'Markdown');
                                        } else {
                                                console.log('n8n webhook success');
                                                // n8n başarılı ise Telegram'a gönderme (LLM cevap verecek)
                                        }
                                });
                        } else {
                                // n8n webhook yoksa direkt Telegram'a gönder
                                sendTelegramMessage(chatId, '`' + userId + '`:' + visitorName + ' ' + msg.text, 'Markdown');
                        }

                        if (users[userIndex]) {
                                users[userIndex].active = true;
                                if (users[userIndex].unactiveTimeout) {
                                        clearTimeout(users[userIndex].unactiveTimeout);
                                }
                        } else {
                                users.push({
                                        userId: userId,
                                        chatId: chatId,
                                        online: true,
                                        active: true,
                                        banned: false,
                                        human_mode: true,
                                        messages: [],
                                        CustomData: CustomData || {},
                                        realIp: realIp,
                                        country: country,
                                        city: city,
                                        region: region,
                                        timezone: timezone,
                                        coordinates: coordinates
                                });
                        }
                });

                client.on('disconnect', function () {
                        const userIndex = users.findIndex(user => user.userId === userId && user.chatId === chatId);
                        if (users[userIndex]) {
                                users[userIndex].online = false;
                                if (users[userIndex].active) {
                                        users[userIndex].unactiveTimeout = setTimeout(() => {
                                                users[userIndex].active = false;
                                        }, 60000);
                                        if (!users[userIndex].banned) {
//                                                 sendTelegramMessage(chatId, '`' + userId + '` has left 🏃💨', 'Markdown', true);
                                        }
                                }
                        }
                });
        });

});

function sendTelegramMessage(chatId, text, parseMode, disableNotification, inlineKeyboard) {
        const options = {
                'chat_id': chatId,
                'text': text,
                'parse_mode': parseMode,
                'disable_notification': !!disableNotification,
        };

        if (inlineKeyboard) {
                options.reply_markup = JSON.stringify({
                        inline_keyboard: inlineKeyboard,
                });
        }

        request
                .post('https://api.telegram.org/bot' + process.env.TELEGRAM_TOKEN + '/sendMessage')
                .form(options)
                .on('response', function (response) {
                        console.log('telegram status code:', response.statusCode);
                });
}



app.post('/usage-start', function (req, res) {
        const chatId = parseInt(req.body.chatId);
        const host = req.body.host;

        let chat = chats.find(chat => chat.chatId === chatId);
        if (!chat) {
                chat = {
                        chatId: chatId,
                        online: defaultOnlineState
                };
                chats.push(chat)
        }

        console.log('usage chat ' + chatId + ' (' + (chat.online ? 'online' : 'offline') + ') from ' + host);
        res.statusCode = 200;
        res.json({
                online: chat.online
        });
});

// left here until the cache expires
app.post('/usage-end', function (req, res) {
        res.statusCode = 200;
        res.end();
});

app.get('/status', function (req, res) {
        const currentTime = new Date().toISOString();
        res.statusCode = 200;
        res.send({
                status: 'ok',
                pingTime: currentTime
        });
        console.log({
                status: 'ok',
                pingTime: currentTime
        })
});

// Statistics API endpoint
app.get('/api/stats', function (req, res) {
        try {
                // Calculate statistics from users array
                const now = new Date();
                const onlineUsers = users.filter(u => u.online);
                const activeUsers = users.filter(u => u.active);

                // Count AI vs Human handled (based on if user received AI response)
                // We'll estimate: if messages were sent through n8n webhook, it's AI handled
                // Otherwise it's human handled
                let aiHandledCount = 0;
                let humanHandledCount = 0;

                // Count unique chat sessions - users who were active
                users.forEach(user => {
                        if (user.active) {
                                // If they have CustomData, we assume they interacted
                                // We'll use a simple heuristic: if they're still active, count them
                                // For now, we'll just count total active users
                                // In future, you might want to track this more accurately
                                humanHandledCount++; // Default to human unless we track AI responses
                        }
                });

                // For now, estimate AI handled as a portion based on n8n integration
                // You can improve this by adding tracking to message handling
                aiHandledCount = Math.floor(activeUsers.length * 0.6); // Estimate 60% AI handled
                humanHandledCount = activeUsers.length - aiHandledCount;

                // Country distribution
                const countryMap = {};
                users.forEach(user => {
                        if (user.country) {
                                countryMap[user.country] = (countryMap[user.country] || 0) + 1;
                        }
                });

                const countries = Object.entries(countryMap)
                        .map(([name, count]) => ({
                                name: name,
                                code: name,
                                count: count,
                                percentage: Math.round((count / users.length) * 100)
                        }))
                        .sort((a, b) => b.count - a.count)
                        .slice(0, 5);

                // Daily users for last 7 days (mock data for now - you'd need to track this)
                const dailyUsers = {
                        labels: getLast7Days(),
                        values: [12, 19, 15, 25, 22, 30, onlineUsers.length]
                };

                // Weekly messages (mock data - you'd need to track this)
                const weeklyMessages = {
                        labels: getLast7Days(),
                        values: [45, 67, 54, 89, 78, 102, 95]
                };

                // Active users details
                const activeUsersList = onlineUsers.slice(0, 20).map(user => ({
                        userId: user.userId,
                        country: user.country || 'Unknown',
                        countryCode: user.country || 'XX',
                        city: user.city || 'Unknown',
                        online: user.online,
                        duration: calculateDuration(user)
                }));

                const stats = {
                        totalUsers: users.length,
                        onlineUsers: onlineUsers.length,
                        activeUsers: activeUsers.length,
                        aiHandled: aiHandledCount,
                        humanHandled: humanHandledCount,
                        totalMessages: users.reduce((sum, u) => sum + (u.messages?.length || 0), 0),
                        avgResponseTime: '2.5 dk',
                        dailyUsers: dailyUsers,
                        aiVsHuman: {
                                ai: aiHandledCount,
                                human: humanHandledCount
                        },
                        weeklyMessages: weeklyMessages,
                        countries: countries,
                        activeUsers: activeUsersList,
                        timestamp: now.toISOString()
                };

                res.statusCode = 200;
                res.json(stats);
        } catch (error) {
                console.error('Stats API error:', error);
                res.statusCode = 500;
                res.json({ error: 'Internal server error' });
        }
});

function getLast7Days() {
        const days = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                days.push(date.toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' }));
        }
        return days;
}

function calculateDuration(user) {
        // This is a placeholder - you'd need to track connection time
        // For now, just return a random duration
        const minutes = Math.floor(Math.random() * 30) + 1;
        return `${minutes} dk`;
}

app.get('/', function (req, res) {
        res.redirect((process.env.REDIRECT_URL || 'https://kintoyyy.github.io/Telegram-Chat-Widget'))
});

http.listen(process.env.PORT || 3000, function () {
        console.log('listening on port:' + (process.env.PORT || 3000));
});

app.get('/.well-known/acme-challenge/:content', (req, res) => {
        res.send(process.env.CERTBOT_RESPONSE);
});
