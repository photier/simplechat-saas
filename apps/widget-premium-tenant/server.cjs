const request = require('request');
const compression = require('compression');
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const geoip = require('geoip-lite');
const app = express();
const http = require('http').Server(app);
// Socket.io v4 with advanced features
const io = require('socket.io')(http, {
	cors: {
		origin: '*',
		methods: ['GET', 'POST'],
		credentials: true
	},
	// Connection State Recovery - auto-recover missed events
	connectionStateRecovery: {
		maxDisconnectionDuration: 2 * 60 * 1000,  // 2 minutes
		skipMiddlewares: true,  // Skip middleware on recovery
	},
	// Performance & reliability
	pingTimeout: 20000,      // 20s before considering connection dead
	pingInterval: 25000,     // Ping every 25s
	upgradeTimeout: 10000,   // 10s to upgrade transport
	maxHttpBufferSize: 1e6,  // 1MB max message size
	// Connection limits
	perMessageDeflate: false,  // Disable compression for better CPU usage
	httpCompression: true,     // Enable HTTP compression
});
const serverLink = process.env.SERVER_URL;
const axios = require('axios');

// Stats server URL
const STATS_SERVER_URL = process.env.STATS_SERVER_URL || 'http://localhost:3002';

// Backend API URL (for fetching chatbot config)
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:3000';

// Widget type - premium widget uses P- prefix
const IS_PREMIUM = true;
const USER_ID_PREFIX = 'P-';

// Helper function to ensure userId has correct prefix (don't duplicate if already has one)
function ensureUserIdPrefix(userId) {
	if (userId.startsWith('W-') || userId.startsWith('P-')) {
		return userId;
	}
	return USER_ID_PREFIX + userId;
}

// Stats namespace for real-time dashboard updates
const statsIO = io.of('/stats');

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
		channel: 'premium',
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

const fs = require('fs');
const path = require('path');
const SETTINGS_FILE = path.join(__dirname, 'data', 'settings.json');

// Default settings
const defaultSettings = {
	serviceMessagesEnabled: false,
	themeColor: '#9F7AEA',  // Default blue color
	widgetConfig: {
		titleClosed: '',
		titleOpen: '⭐ Premium Support',
		introMessage: 'Welcome to Premium Support! How can I assist you? ✨',
		aiIntroMessage: 'Hi there! 👋 I am Photier AI, your 24/7 virtual assistant. How can I help you today?',
		workingHoursEnabled: true,
		workingHoursStart: '09:00',
		workingHoursEnd: '18:00',
		skin: process.env.WIDGET_SKIN || 'default'  // Allow env override for Railway
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
					'	"username": "$(username)",\n' +
					'	"ip address": "$(ip)",\n' +
					'	"Mac address": "$(mac)",\n' +
					'	"trial": "$(trial)",\n' +
					'	"interface" : "$(interface-name)",\n' +
					'	"vlan" : "$(vlan-id)"\n' +
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
				const rawUserId = replyText.split(':')[0];
			const userId = rawUserId.replace(/^W-/, '').trim();
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

					// Send admin reply to N8N for database logging
					const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'https://n8n.simplechat.bot/webhook/admin-chat';
					request.post(n8nWebhookUrl)
						.form({
							userId: rawUserId,  // Use prefixed userId for N8N
							chatId: chatId,
							message: text,
							from: 'admin',
							channel: 'telegram_web',
							timestamp: new Date().toISOString(),
							premium: true
						})
						.on('response', function(response) {
							console.log('N8N webhook response (admin reply):', response.statusCode);
						})
						.on('error', function(error) {
							console.error('N8N webhook error (admin reply):', error);
						});
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
			request.post('https://api.telegram.org/bot' + process.env.TELEGRAM_TOKEN_PREMIUM + '/answerCallbackQuery')
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

// handle chat visitors websocket messages
io.on('connection', function (client) {

	const realIp = client.handshake.headers['cf-connecting-ip'] ||
	               client.handshake.headers['x-forwarded-for']?.split(',')[0] ||
	               client.handshake.headers['x-real-ip'] ||
	               client.handshake.address;

	const geo = geoip.lookup(realIp);
	const country = geo?.country || '';
	const city = geo?.city || '';

	console.log('Client connected from IP:', realIp, 'Country:', country, 'City:', city);

	client.on('register', function (registerMsg) {
		console.log('🔵 REGISTER EVENT TRIGGERED!', registerMsg);

		const userId = registerMsg.userId; // Use original for socket.io
		const prefixedUserId = ensureUserIdPrefix(userId); // Use prefix for N8N/Telegram/Stats
		const chatId = parseInt(registerMsg.chatId);
		const CustomData = registerMsg.CustomData;

		// Track widget open in stats database
		try {
			console.log('📊 Tracking widget open:', { userId: prefixedUserId, country, city, premium: IS_PREMIUM });

			// Send to stats API
			request.post({
				url: `${STATS_SERVER_URL}/api/widget-open`,
				json: true,
				body: {
					userId: prefixedUserId,
				chatId: chatId, // CRITICAL: Send chatId for schema routing
					country: country,
					city: city,
					premium: IS_PREMIUM,
					host: registerMsg.host || ''
				}
			}, function(err, response, body) {
				if (err) {
					console.error('❌ Failed to track widget open:', err.message);
					console.error('❌ Full error:', err);
					console.error('❌ Attempting URL:', `${STATS_SERVER_URL}/api/widget-open`);
				} else {
					console.log('✅ Widget open tracked', response.statusCode);

					// Emit real-time event to stats dashboard
					statsIO.emit('stats_update', {
						type: 'widget_opened',
						data: {
							userId: prefixedUserId,
							country: country,
							city: city,
							premium: IS_PREMIUM,
							timestamp: new Date().toISOString(),
							channel: 'premium'
						}
					});
				}
			});
		} catch (error) {
			console.error('❌ Error tracking widget open:', error);
		}

		// Auto notification disabled - was sending unwanted messages
		// console.log('useId ' + userId + ' connected to chatId ' + chatId);

		// const CustomMsg = `\`${userId}\`: *connected to chat* 😶‍🌫️\n\n`;
		const CustomMsg = "";
		let CustomMsgData = '';

		if (CustomData) {
			CustomMsgData = `${Object.entries(CustomData).map(([label, value]) => `${label}: ${value}`).join('\n')}`;
		}

		// Send connection message if service messages are enabled
		if (settings.serviceMessagesEnabled && CustomMsgData) {
			sendTelegramMessage(chatId, `${CustomMsgData}`, 'Markdown', true);
		}


		const userIndex = users.findIndex(user => user.userId === userId && user.chatId === chatId);
		if (users[userIndex]) {
			if (users[userIndex].banned) {
				client.disconnect();
				return;
			}

			users[userIndex].online = true;
			users[userIndex].country = country;
			users[userIndex].city = city;
			users[userIndex].messages.forEach(message => io.emit(chatId + '-' + userId, message));
			users[userIndex].messages = [];

			// Auto notification disabled
			/*
			if (users[userIndex].active) {
				sendTelegramMessage(chatId, '`' + userId + '` has come back 👋', 'Markdown', true);
			}
			*/
		}


		client.on('message', function (msg) {

			console.log('🔵 [Server] Message received from widget');
			console.log('🔵 [Server] msg.human_mode:', msg.human_mode);
			console.log('🔵 [Server] msg.text:', msg.text);
			console.log('🔵 [Server] Full msg object:', JSON.stringify(msg, null, 2));

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

			// Send user message to Telegram if service messages are enabled
			if (settings.serviceMessagesEnabled) {
				sendTelegramMessage(chatId, '`' + userId + '`:' + visitorName + ' ' + msg.text, 'Markdown');
			}

			// Send message to N8N webhook
			const prefixedUserId = ensureUserIdPrefix(userId);

			// Broadcast to stats dashboard IMMEDIATELY (don't wait for n8n response)
			broadcastStatsUpdate('new_message', {
				userId: prefixedUserId,
				chatId: chatId,
				from: 'user',
				message: msg.text,
				visitorName: msg.visitorName || userId
			});

			const n8nWebhookUrlForMessage = process.env.N8N_WEBHOOK_URL || 'https://n8n.simplechat.bot/webhook/admin-chat';
		request.post(n8nWebhookUrlForMessage)
				.form({
					userId: prefixedUserId,
					chatId: chatId,
					message: msg.text,
					from: 'user',
				channel: 'widget_web',
					timestamp: new Date().toISOString(),
					visitorName: msg.visitorName || userId,
					CustomData: JSON.stringify(users[userIndex]?.CustomData || {}),
					messageSource: msg.messageSource || 'ai_bot',
					human_mode: msg.human_mode || false,
					country: country,
					city: city,
					premium: true
				})
				.on('response', function(response) {
					console.log('N8N webhook response:', response.statusCode);
				})
				.on('error', function(error) {
					console.error('N8N webhook error:', error);
				});



			if (users[userIndex]) {
				users[userIndex].active = true;
				if (users[userIndex].unactiveTimeout) {
					clearTimeout(users[userIndex].unactiveTimeout);
				}

			// Broadcast to stats dashboard: user is active (send message)
			broadcastStatsUpdate('user_online', {
				userId: prefixedUserId,
				chatId: chatId
			});
			} else {
				users.push({
					userId: userId,
					chatId: chatId,
					online: true,
					active: true,
					banned: false,
					messages: [],
					CustomData: CustomData || {},
					country: country,
					city: city
				});

				// Broadcast to stats dashboard: new user online
				broadcastStatsUpdate('user_online', {
					userId: prefixedUserId,
					chatId: chatId
				});
			}
		});

		client.on('disconnect', function () {
			const userIndex = users.findIndex(user => user.userId === userId && user.chatId === chatId);
			if (users[userIndex]) {
				users[userIndex].online = false;

				// Broadcast to stats dashboard: user went offline
				const prefixedUserId = ensureUserIdPrefix(userId);
				broadcastStatsUpdate('user_offline', {
					userId: prefixedUserId,
					chatId: chatId
				});

				if (users[userIndex].active) {
					users[userIndex].unactiveTimeout = setTimeout(() => {
						users[userIndex].active = false;
					}, 60000);
					if (!users[userIndex].banned) {
						// sendTelegramMessage(chatId, '`' + userId + '` has left 🏃💨', 'Markdown', true);
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
		.post('https://api.telegram.org/bot' + process.env.TELEGRAM_TOKEN_PREMIUM + '/sendMessage')
		.form(options)
		.on('response', function (response) {
			console.log('telegram status code:', response.statusCode);
		});
}

app.post('/send-to-user', function (req, res) {
	try {
		let { userId, chatId, message, from, human_mode } = req.body;

		// If from is 'agent' or 'admin', it's always Live Support (human_mode = true)
		if (from === 'agent' || from === 'admin') {
			human_mode = true;
		}

		// Ensure userId has correct prefix (N8N removes prefix, we need to add it back)
		const prefixedUserId = ensureUserIdPrefix(userId);

		console.log('n8n response > ' + message, 'to userId:', prefixedUserId, 'from:', from, 'human_mode:', human_mode);

		io.emit(chatId + '-' + prefixedUserId, {
			text: message,
			from: from || 'bot',
			name: 'AI Assistant',
		human_mode: human_mode // Pass human_mode to widget for styling
		});

		// Broadcast bot response to stats dashboard
		broadcastStatsUpdate('new_message', {
			userId: prefixedUserId, // Keep prefix for stats
			chatId: chatId,
			from: from || 'bot',
			message: message,
			visitorName: userId,
			human_mode: human_mode  // Include human_mode in broadcast
		});

		res.statusCode = 200;
		res.json({ success: true });
	} catch (e) {
		console.error('send-to-user error', e);
		res.statusCode = 500;
		res.json({ success: false, error: e.message });
	}
});

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
		online: chat.online,
		themeColor: settings.themeColor
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

// Settings API endpoints
app.get('/api/settings', function (req, res) {
	res.statusCode = 200;
	res.json({
		success: true,
		serviceMessagesEnabled: settings.serviceMessagesEnabled
	});
});

app.post('/api/settings', function (req, res) {
	try {
		const { serviceMessagesEnabled } = req.body;

		if (typeof serviceMessagesEnabled !== 'boolean') {
			res.statusCode = 400;
			res.json({ success: false, error: 'Invalid parameter' });
			return;
		}

		settings.serviceMessagesEnabled = serviceMessagesEnabled;
		saveSettings(settings);
		console.log('Settings updated:', settings);

		res.statusCode = 200;
		res.json({
			success: true,
			serviceMessagesEnabled: settings.serviceMessagesEnabled
		});
	} catch (e) {
		console.error('Settings update error:', e);
		res.statusCode = 500;
		res.json({ success: false, error: e.message });
	}
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
app.get('/api/widget-config', async function (req, res) {
	try {
		// Extract chatId from subdomain (e.g., bot_xxx.p.simplechat.bot → bot_xxx)
		const host = req.hostname || req.get('host') || '';
		const subdomain = host.split('.')[0];

		// For tenant widgets, fetch config from database via backend API
		if (subdomain && subdomain.startsWith('bot_')) {
			console.log(`[Config API] Fetching config for chatId: ${subdomain}`);

			try {
				// Fetch chatbot config from backend (public endpoint, no auth needed)
				const response = await axios.get(`${BACKEND_API_URL}/public/chatbot/${subdomain}/config`, {
					timeout: 5000  // 5 second timeout
				});

				if (response.data && response.data.config) {
					console.log(`[Config API] ✓ Config loaded from database for ${subdomain}`);
					res.statusCode = 200;
					res.json({
						success: true,
						config: response.data.config
					});
					return;
				}
			} catch (error) {
				console.error(`[Config API] ❌ Failed to fetch config for ${subdomain}:`, error.message);
				// Fall through to default config
			}
		}

		// Fallback to file-based config (for non-tenant widgets or if database fetch fails)
		console.log('[Config API] Using fallback config from settings.json');
		res.statusCode = 200;
		res.json({
			success: true,
			config: settings.widgetConfig
		});
	} catch (error) {
		console.error('[Config API] Error:', error);
		res.statusCode = 500;
		res.json({
			success: false,
			error: 'Failed to fetch widget configuration'
		});
	}
});

app.post('/api/widget-config', function (req, res) {
	try {
		const {
			titleClosed,
			titleOpen,
			introMessage,
			workingHoursEnabled,
			workingHoursStart,
			workingHoursEnd,
			skin
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

		if (skin && typeof skin !== 'string') {
			res.statusCode = 400;
			res.json({ success: false, error: 'Invalid skin format' });
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
		if (skin !== undefined) settings.widgetConfig.skin = skin;

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

// CDN Embed Loader Endpoint
// Usage: <script src="https://cdn.simplechat.bot/embed.js" data-chat-id="bot_xxx" data-type="premium"></script>
app.get('/embed.js', function (req, res) {
	res.setHeader('Content-Type', 'application/javascript');
	res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
	res.setHeader('Access-Control-Allow-Origin', '*'); // Allow CORS for CDN usage

	// Minified loader script (same as widget-tenant, supports both types)
	const loaderScript = `(function(){var s=document.currentScript||document.querySelector('script[src*="embed.js"]');if(!s)return;var c=s.getAttribute('data-chat-id');var t=s.getAttribute('data-type')||'basic';var l=s.getAttribute('data-lang')||'auto';if(!c){console.error('SimpleChat: data-chat-id is required');return;}var h=t==='premium'?'https://'+c+'.p.simplechat.bot':'https://'+c+'.w.simplechat.bot';window.simpleChatConfig={chatId:c,userId:(t==='premium'?'P-Guest-':'W-Guest-')+Math.random().toString(36).substr(2,9),host:h,locale:l};var css=document.createElement('link');css.rel='stylesheet';css.href=h+'/css/simple-chat'+(t==='premium'?'-premium':'')+'.css?v='+Date.now();document.head.appendChild(css);var js=document.createElement('script');js.src=h+'/js/simple-chat'+(t==='premium'?'-premium':'')+'.min.js?v='+Date.now();js.async=true;document.body.appendChild(js);})();`;

	res.send(loaderScript);
});

// Multi-tenant wildcard subdomain routing
// Extract chatId from subdomain: bot_xxx.p.simplechat.bot → bot_xxx
app.get('/', function (req, res) {
	const host = req.hostname || req.get('host') || '';
	const subdomain = host.split('.')[0]; // bot_nO6cb_Q9ni

	// Check if subdomain looks like a tenant chatId (starts with bot_)
	if (subdomain && subdomain.startsWith('bot_')) {
		console.log(`[Tenant Premium Widget] Serving widget for chatId: ${subdomain}`);
		res.sendFile(__dirname + '/static/index.html');
	} else {
		console.log(`[Tenant Premium Widget] Unknown subdomain: ${host}, redirecting`);
		res.redirect((process.env.REDIRECT_URL || 'https://simplechat.bot'));
	}
});

http.listen(process.env.PORT || 3000, function () {
	console.log('listening on port:' + (process.env.PORT || 3000));
});

app.get('/.well-known/acme-challenge/:content', (req, res) => {
	res.send(process.env.CERTBOT_RESPONSE);
});
