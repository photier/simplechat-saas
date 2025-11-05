const request = require('request');
const compression = require('compression');
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const geoip = require('geoip-lite');
const fs = require('fs');
const path = require('path');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
	cors: {
		origin: '*',
		methods: ['GET', 'POST'],
		credentials: true
	}
});
const serverLink = process.env.SERVER_URL;

// Stats namespace for dashboard real-time updates
const statsIO = io.of('/stats');

// Stats server URL
const STATS_SERVER_URL = process.env.STATS_SERVER_URL || 'http://localhost:3002';

// Widget type - normal widget uses W- prefix
const IS_PREMIUM = false;
const USER_ID_PREFIX = 'W-';

// Settings file location
const SETTINGS_FILE = path.join(__dirname, 'data', 'settings.json');

// Default settings
const defaultSettings = {
	serviceMessagesEnabled: false,
	themeColor: '#009EF7',  // Default blue color
	widgetConfig: {
		titleClosed: '',
		titleOpen: 'Chat with us',
		introMessage: 'Hi there! How can we help you today?',
		workingHoursEnabled: false,
		workingHoursStart: '09:00',
		workingHoursEnd: '18:00'
	}
};

// Load settings from file
function loadSettings() {
	try {
		if (fs.existsSync(SETTINGS_FILE)) {
			const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
			const loaded = JSON.parse(data);
			console.log('✓ Settings loaded from file');
			return { ...defaultSettings, ...loaded };
		}
	} catch (error) {
		console.error('Error loading settings:', error);
	}
	console.log('✓ Using default settings');
	return defaultSettings;
}

// Save settings to file
function saveSettings(newSettings) {
	try {
		const dataDir = path.dirname(SETTINGS_FILE);
		if (!fs.existsSync(dataDir)) {
			fs.mkdirSync(dataDir, { recursive: true });
		}
		fs.writeFileSync(SETTINGS_FILE, JSON.stringify(newSettings, null, 2));
		console.log('✓ Settings saved to file');
		return true;
	} catch (error) {
		console.error('Error saving settings:', error);
		return false;
	}
}

// Initialize settings
let settings = loadSettings();

// Log when stats clients connect
statsIO.on('connection', function(socket) {
	console.log('📊 Stats dashboard connected:', socket.id);

	socket.on('disconnect', function() {
		console.log('📊 Stats dashboard disconnected:', socket.id);
	});
});

// Broadcast stats update to all connected dashboards
function broadcastStatsUpdate(type, data) {
	const message = {
		type: type,
		channel: 'web',
		timestamp: new Date().toISOString(),
		data: data
	};
	console.log('📡 Broadcasting to stats:', type, data.userId || '');
	statsIO.emit('stats_update', message);
}

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

                        if (reply && text) {
                                const replyText = reply.text || '';
                                const userId = replyText.split(':')[0];
                                const userIndex = users.findIndex(user => user.userId === userId && user.chatId === chatId);

                                console.log(userId)

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
                const { userId, chatId, message, from } = req.body;

                // Remove W- prefix if exists (N8N sends W-Guest-xxx, client listens to Guest-xxx)
                const cleanUserId = userId.replace(/^[WP]-/, '');

                console.log('n8n response > ' + message, 'to userId:', cleanUserId, 'from:', from);

                io.emit(chatId + '-' + cleanUserId, {
                        text: message,
                        from: from || 'bot',
                        name: 'AI Assistant'
                });

                // Broadcast bot response to stats dashboard
                const prefixedUserId = userId.startsWith('W-') || userId.startsWith('P-') ? userId : (USER_ID_PREFIX + userId);
                broadcastStatsUpdate('new_message', {
                        userId: prefixedUserId, // Keep prefix for stats
                        chatId: chatId,
                        from: from || 'bot',
                        message: message,
                        visitorName: cleanUserId
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

        client.on('register', function (registerMsg) {

                const userId = registerMsg.userId;
                const chatId = parseInt(registerMsg.chatId);
                const CustomData = registerMsg.CustomData;

                console.log('useId ' + userId + ' connected to chatId ' + chatId);

                // Track widget open in stats database
                try {
                        // Extract IP address from socket
                        const clientIp = client.handshake.headers['x-forwarded-for']?.split(',')[0] ||
                                         client.handshake.headers['x-real-ip'] ||
                                         client.handshake.address;

                        // Get country/city from IP
                        const geo = geoip.lookup(clientIp);
                        const country = geo?.country || '';
                        const city = geo?.city || '';

                        // Add W- or P- prefix to userId for stats tracking
                        const prefixedUserId = USER_ID_PREFIX + userId;

                        console.log('📊 Tracking widget open:', { userId: prefixedUserId, country, city, premium: IS_PREMIUM });

                        // Send to stats API
                        request.post({
                                url: `${STATS_SERVER_URL}/api/widget-open`,
                                json: true,
                                body: {
                                        userId: prefixedUserId,
                                        country: country,
                                        city: city,
                                        premium: IS_PREMIUM,
                                        host: registerMsg.host || ''
                                }
                        }, function(err, response, body) {
                                if (err) {
                                        console.error('❌ Failed to track widget open:', err.message);
                                } else {
                                        console.log('✅ Widget open tracked');

                                        // Emit real-time event to stats dashboard
                                        statsIO.emit('widget_opened', {
                                                userId: prefixedUserId,
                                                country: country,
                                                city: city,
                                                premium: IS_PREMIUM,
                                                timestamp: new Date().toISOString(),
                                                channel: 'web'
                                        });
                                }
                        });
                } catch (error) {
                        console.error('❌ Error tracking widget open:', error);
                }

                const CustomMsg = `\`${userId}\`: *connected to chat* 😶‍🌫️\n\n`;
                let CustomMsgData = '';

                if (CustomData) {
                        CustomMsgData = `${Object.entries(CustomData).map(([label, value]) => `${label}: ${value}`).join('\n')}`;
                }

                sendTelegramMessage(chatId, `${CustomMsg}${CustomMsgData}`, 'Markdown', true);


                const userIndex = users.findIndex(user => user.userId === userId && user.chatId === chatId);
                if (users[userIndex]) {
                        if (users[userIndex].banned) {
                                client.disconnect();
                                return;
                        }

                        users[userIndex].online = true;
                        users[userIndex].messages.forEach(message => io.emit(chatId + '-' + userId, message));
                        users[userIndex].messages = [];

                        // Broadcast to stats dashboard: user came online
                        const prefixedUserId = USER_ID_PREFIX + userId;
                        broadcastStatsUpdate('user_online', {
                                userId: prefixedUserId,
                                timestamp: new Date().toISOString()
                        });

                        if (users[userIndex].active) {
                                sendTelegramMessage(chatId, '`' + userId + '` has come back 👋', 'Markdown', true);
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

                        // Broadcast to stats dashboard IMMEDIATELY (don't wait for n8n response)
                        const prefixedUserId = USER_ID_PREFIX + userId;
                        broadcastStatsUpdate('new_message', {
                                userId: prefixedUserId,
                                message: msg.text,
                                timestamp: new Date().toISOString()
                        });

                        // n8n webhook'una mesajı gönder
                        const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
                        if (n8nWebhookUrl) {
                                request.post(n8nWebhookUrl, {
                                        json: {
                                                userId: userId,
                                                chatId: chatId,
                                                message: msg.text,
                                                visitorName: msg.visitorName || '',
                                                pageUrl: msg.pageUrl || '',
                                                pageTitle: msg.pageTitle || '',
                                                referrer: msg.referrer || '',
                                                userAgent: msg.userAgent || '',
                                                browserLang: msg.browserLang || '',
                                                timestamp: msg.timestamp || new Date().toISOString()
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
                                        messages: [],
                                        CustomData: CustomData || {}
                                });

                                // Broadcast to stats dashboard: new user online
                                const prefixedUserId = USER_ID_PREFIX + userId;
                                broadcastStatsUpdate('user_online', {
                                        userId: prefixedUserId,
                                        timestamp: new Date().toISOString()
                                });
                        }
                });

                client.on('disconnect', function () {
                        const userIndex = users.findIndex(user => user.userId === userId && user.chatId === chatId);
                        if (users[userIndex]) {
                                users[userIndex].online = false;

                                // Broadcast to stats dashboard: user went offline
                                const prefixedUserId = USER_ID_PREFIX + userId;
                                broadcastStatsUpdate('user_offline', {
                                        userId: prefixedUserId,
                                        timestamp: new Date().toISOString()
                                });

                                if (users[userIndex].active) {
                                        users[userIndex].unactiveTimeout = setTimeout(() => {
                                                users[userIndex].active = false;
                                        }, 60000);
                                        if (!users[userIndex].banned) {
                                                sendTelegramMessage(chatId, '`' + userId + '` has left 🏃💨', 'Markdown', true);
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
        console.log('DEBUG /usage-start req.body:', req.body);
        const chatId = parseInt(req.body.chatId);
        const host = req.body.host;
        console.log('DEBUG chatId after parseInt:', chatId, 'type:', typeof chatId);

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

// Theme API endpoints
app.get('/api/theme', function (req, res) {
	res.statusCode = 200;
	res.json({
		success: true,
		themeColor: settings.themeColor
	});
});

app.post('/api/theme', function (req, res) {
	try {
		const { themeColor } = req.body;

		if (!themeColor || !/^#[0-9A-F]{6}$/i.test(themeColor)) {
			res.statusCode = 400;
			res.json({ success: false, error: 'Invalid color format. Use hex format like #009EF7' });
			return;
		}

		settings.themeColor = themeColor;
		saveSettings(settings);
		console.log('Theme color updated:', settings.themeColor);

		res.statusCode = 200;
		res.json({
			success: true,
			themeColor: settings.themeColor
		});
	} catch (e) {
		console.error('Theme update error:', e);
		res.statusCode = 500;
		res.json({ success: false, error: e.message });
	}
});

// Widget Configuration API endpoints
app.get('/api/widget-config', function (req, res) {
	res.statusCode = 200;
	res.json({
		success: true,
		config: settings.widgetConfig
	});
});

app.post('/api/widget-config', function (req, res) {
	try {
		const {
			titleClosed,
			titleOpen,
			introMessage,
			workingHoursEnabled,
			workingHoursStart,
			workingHoursEnd
		} = req.body;

		// Validate inputs
		if (titleOpen && typeof titleOpen !== 'string') {
			res.statusCode = 400;
			res.json({ success: false, error: 'Invalid titleOpen format' });
			return;
		}

		if (titleClosed && typeof titleClosed !== 'string') {
			res.statusCode = 400;
			res.json({ success: false, error: 'Invalid titleClosed format' });
			return;
		}

		if (introMessage && typeof introMessage !== 'string') {
			res.statusCode = 400;
			res.json({ success: false, error: 'Invalid introMessage format' });
			return;
		}

		if (typeof workingHoursEnabled !== 'boolean') {
			res.statusCode = 400;
			res.json({ success: false, error: 'workingHoursEnabled must be boolean' });
			return;
		}

		// Validate time format HH:MM
		const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
		if (workingHoursStart && !timeRegex.test(workingHoursStart)) {
			res.statusCode = 400;
			res.json({ success: false, error: 'Invalid workingHoursStart format. Use HH:MM (e.g., 09:00)' });
			return;
		}

		if (workingHoursEnd && !timeRegex.test(workingHoursEnd)) {
			res.statusCode = 400;
			res.json({ success: false, error: 'Invalid workingHoursEnd format. Use HH:MM (e.g., 18:00)' });
			return;
		}

		// Update settings
		if (titleClosed !== undefined) settings.widgetConfig.titleClosed = titleClosed;
		if (titleOpen !== undefined) settings.widgetConfig.titleOpen = titleOpen;
		if (introMessage !== undefined) settings.widgetConfig.introMessage = introMessage;
		if (workingHoursEnabled !== undefined) settings.widgetConfig.workingHoursEnabled = workingHoursEnabled;
		if (workingHoursStart !== undefined) settings.widgetConfig.workingHoursStart = workingHoursStart;
		if (workingHoursEnd !== undefined) settings.widgetConfig.workingHoursEnd = workingHoursEnd;

		saveSettings(settings);
		console.log('Widget config updated:', settings.widgetConfig);

		res.statusCode = 200;
		res.json({
			success: true,
			config: settings.widgetConfig
		});
	} catch (e) {
		console.error('Widget config update error:', e);
		res.statusCode = 500;
		res.json({ success: false, error: e.message });
	}
});

app.get('/', function (req, res) {
        res.redirect((process.env.REDIRECT_URL || 'https://kintoyyy.github.io/Telegram-Chat-Widget'))
});

http.listen(process.env.PORT || 3000, function () {
        console.log('listening on port:' + (process.env.PORT || 3000));
});

app.get('/.well-known/acme-challenge/:content', (req, res) => {
        res.send(process.env.CERTBOT_RESPONSE);
});
