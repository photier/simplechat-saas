import * as store from 'store';
import io from 'socket.io-client';

import { h, Component } from 'preact';
import MessageArea from './message-area';

export default class Chat extends Component {
    autoResponseState = 'pristine';
    autoResponseTimer = 0;

    constructor(props) {
        super(props);

        let messages = [];
        if (store.enabled) {
            this.messagesKey = 'messages' + '.' + props.chatId + '.' + props.host;
            messages = store.get(this.messagesKey) || store.set(this.messagesKey, []);
        }

        this.state = {
            messages: messages,
            isMobile: this.isMobileDevice()
        };
    }

    componentDidMount() {
        console.log('🔌 Chat componentDidMount - connecting Socket.io...');
        this.socket = io.connect();
        this.socket.on('connect', () => {
            console.log('✅ Socket.io connected! Emitting register event...');
            console.log('📤 Register data:', { chatId: this.props.chatId, userId: this.props.userId });
            this.socket.emit('register', { chatId: this.props.chatId, userId: this.props.userId, CustomData: this.props.CustomData, helpMsg: this.props.conf.helpMessage });
        });
        this.socket.on(this.props.chatId, this.incomingMessage);
        this.socket.on(this.props.chatId + '-' + this.props.userId, this.incomingMessage);

        if (!this.state.messages.length && this.props.conf.introMessage) {
            this.writeToMessages({ text: this.props.conf.introMessage, from: 'admin' });
        }

        // Refresh mesajını dinle
        window.addEventListener('message', this.handleClearChat);
    }

    componentWillUnmount() {
        window.removeEventListener('message', this.handleClearChat);
    }

    handleClearChat = (event) => {
        console.log('Message received:', event.data);
        if (event.data && event.data.type === 'CLEAR_CHAT') {
            console.log('Clearing chat...');
            // localStorage temizle
            if (store.enabled && this.messagesKey) {
                store.remove(this.messagesKey);
            }
            // State temizle
            this.setState({ messages: [] });
            // Intro mesajını tekrar göster
            if (this.props.conf.introMessage) {
                setTimeout(() => {
                    this.writeToMessages({ text: this.props.conf.introMessage, from: 'admin' });
                }, 100);
            }
        }
    }

    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    render({ }, state) {
        const inputEvent = state.isMobile ? null : this.handleKeyPress;

        return (
            <div class="wrapper">
                <MessageArea messages={state.messages} conf={this.props.conf} />
                <div class="input-area">
                    <textarea
                        class="textarea"
                        type="text"
                        rows="1"
                        placeholder={this.props.conf.placeholderText}
                        ref={(input) => {
                            this.input = input;
                        }}
                        onKeyPress={inputEvent}
                    />

                    <button type="button" onClick={this.handleSendMessage}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="1em"
                            height="1em"
                            fill="blue"
                            viewBox="0 0 1024 1024"
                        >
                            <path
                                d="M110.9 558.2l147.3 64.5L682.7 391.1l-256 298.7 366.9 167.1a42.7 42.7 0 0 0 59.7-36.3l42.7-640a42.8 42.8 0 0 0-60.8-41.5l-725.3 341.4a42.8 42.8 0 0 0 1 77.7zM341.3 945.8l203.8-98.8L341.3 751.9z">
                            </path>
                        </svg>
                    </button>
                </div>
            </div>
        );
    }

    handleKeyPress = (e) => {
        let text = this.input.value.trim();
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage(text);
        }
    };

    handleSendMessage = () => {
        let text = this.input.value.trim();
        this.sendMessage(text);
    };

    sendMessage = (text) => {
        if (text) {
            text = text.replace(/\n{2,}/g, '\n');
// Sayfa bilgilerini topla
            let pageUrl, pageTitle, referrer;
            try {
                pageUrl = window.parent.location.href;
                pageTitle = window.parent.document.title;
                referrer = window.parent.document.referrer || '';
            } catch(e) {
                pageUrl = 'https://' + this.props.host;
                pageTitle = this.props.host;
                referrer = '';
            }
            
            this.socket.send({ 
                text, 
                from: 'visitor', 
                visitorName: this.props.conf.visitorName,
                pageUrl: pageUrl,
                pageTitle: pageTitle,
                browserLang: navigator.language,
                referrer: referrer,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString()
            });

            this.input.value = '';

            // AutoResponse disabled - was causing unwanted automated messages
            /*
            if (this.autoResponseState === 'pristine') {
                if (this.props.conf.autoResponse) {
                    setTimeout(() => {
                        this.writeToMessages({
                            text: this.props.conf.autoResponse,
                            from: 'admin',
                        });
                    }, 500);
                }

                if (this.props.conf.autoNoResponse) {
                    this.autoResponseTimer = setTimeout(() => {
                        this.writeToMessages({
                            text: this.props.conf.autoNoResponse,
                            from: 'admin',
                        });
                        this.autoResponseState = 'canceled';
                    }, 60 * 1000);
                }
                this.autoResponseState = 'set';
            }
            */
        }
    };

    incomingMessage = (msg) => {
        this.writeToMessages(msg);
        if (msg.from === 'admin') {
            document.getElementById('messageSound').play();

            // AutoResponse state management disabled
            /*
            if (this.autoResponseState === 'pristine') {
                this.autoResponseState = 'canceled';
            } else if (this.autoResponseState === 'set') {
                this.autoResponseState = 'canceled';
                clearTimeout(this.autoResponseTimer);
            }
            */
        }
    };

    writeToMessages = (msg) => {
        msg.time = msg.time ? new Date(msg.time) : new Date();
        this.setState({
            messages: this.state.messages.concat(msg),
        });

        if (store.enabled) {
            try {
                store.transact(this.messagesKey, (messages) => {
                    messages.push(msg);
                });
            } catch (e) {
                console.log('failed to add new message to local storage', e);
                store.set(this.messagesKey, []);
            }
        }
    };
}
