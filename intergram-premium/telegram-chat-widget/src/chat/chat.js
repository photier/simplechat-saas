import * as store from 'store';
import io from 'socket.io-client';

import { h, Component } from 'preact';
import MessageArea from './message-area';

export default class Chat extends Component {
    autoResponseState = 'pristine';
    autoResponseTimer = 0;

    constructor(props) {
        super(props);

        // CRITICAL: Two separate message arrays - one for each tab
        if (store.enabled) {
            this.aiMessagesKey = 'messages.ai' + '.' + props.chatId + '.' + props.host;
            this.humanMessagesKey = 'messages.human' + '.' + props.chatId + '.' + props.host;
            this.aiMessages = store.get(this.aiMessagesKey) || [];
            this.humanMessages = store.get(this.humanMessagesKey) || [];
        } else {
            this.aiMessages = [];
            this.humanMessages = [];
        }


        // Preact 10 FIX: Initialize this.state object FIRST
        let isMobile = this.isMobileDevice();
        // Premium chat için AI mode default (human_mode false)
        let humanMode = false;
        let overlayDismissed = false;

        // Show messages from active tab
        let messages = humanMode ? this.humanMessages : this.aiMessages;

        this.state = {
            isMobile: isMobile,
            humanMode: humanMode,
            overlayDismissed: overlayDismissed,
            messages: messages
        };
    }

    componentDidMount() {
        this.socket = io.connect();
        this.socket.on('connect', () => {
            this.socket.emit('register', { chatId: this.props.chatId, userId: this.props.userId, CustomData: this.props.CustomData, helpMsg: this.props.conf.helpMessage });
        });
        this.socket.on(this.props.chatId, this.incomingMessage);
        this.socket.on(this.props.chatId + '-' + this.props.userId, this.incomingMessage);

        // AI Bot intro message
        if (!this.aiMessages.length && this.props.conf.aiIntroMessage) {
            this.aiMessages.push({ text: this.props.conf.aiIntroMessage, from: 'admin', time: new Date() });
            if (store.enabled) {
                store.set(this.aiMessagesKey, this.aiMessages);
            }
        }

        // Live Support intro message
        if (!this.humanMessages.length && this.props.conf.introMessage) {
            this.humanMessages.push({ text: this.props.conf.introMessage, from: 'admin', time: new Date() });
            if (store.enabled) {
                store.set(this.humanMessagesKey, this.humanMessages);
            }
        }

        // Display active tab's messages
        this.setState({
            messages: this.state.humanMode ? this.humanMessages : this.aiMessages
        });

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

            // Clear both arrays
            this.aiMessages = [];
            this.humanMessages = [];

            // Clear localStorage
            if (store.enabled) {
                store.remove(this.aiMessagesKey);
                store.remove(this.humanMessagesKey);
            }

            // Re-add intro messages
            if (this.props.conf.aiIntroMessage) {
                this.aiMessages.push({ text: this.props.conf.aiIntroMessage, from: 'admin', time: new Date() });
                if (store.enabled) {
                    store.set(this.aiMessagesKey, this.aiMessages);
                }
            }

            if (this.props.conf.introMessage) {
                this.humanMessages.push({ text: this.props.conf.introMessage, from: 'admin', time: new Date() });
                if (store.enabled) {
                    store.set(this.humanMessagesKey, this.humanMessages);
                }
            }

            // Update state
            this.setState({
                messages: this.state.humanMode ? this.humanMessages : this.aiMessages
            });
        }
    }

    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // CRITICAL: Switch tab function to load that tab's conversation history
    switchTab = (isHumanMode) => {
        const newMessages = isHumanMode ? this.humanMessages : this.aiMessages;
        this.setState({
            humanMode: isHumanMode,
            messages: newMessages
        });
    };

    render({ }, state) {
        const inputEvent = state.isMobile ? null : this.handleKeyPress;

        return (
            <div class="wrapper" style={{ position: 'relative' }}>
                <MessageArea messages={state.messages} conf={this.props.conf} />
                {/* Segmented Control - Apple Style */}
                <div style={{
                    padding: '10px 20px 8px 20px',
                    borderBottom: '1px solid #e8e8e8',
                    position: 'relative',
                    zIndex: 1001
                }}>
                    <div style={{
                        display: 'flex',
                        gap: '4px',
                        backgroundColor: '#f2f2f7',
                        borderRadius: '17px',
                        padding: '2px',
                        position: 'relative'
                    }}>
                        {/* Live Support Tab */}
                        <button
                            type="button"
                            onClick={() => this.switchTab(true)}
                            style={{
                                flex: 1,
                                padding: '8px 14px',
                                border: 'none',
                                borderRadius: '14px',
                                backgroundColor: state.humanMode ? '#ffffff' : 'transparent',
                                color: state.humanMode ? '#1d1d1f' : '#86868b',
                                fontSize: '13px',
                                fontWeight: state.humanMode ? '600' : '500',
                                cursor: 'pointer',
                                transition: 'all 0.25s ease',
                                boxShadow: state.humanMode
                                    ? '0 2px 8px rgba(0,0,0,0.12)'
                                    : 'none',
                                whiteSpace: 'nowrap',
                                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                            }}
                        >
                            👤 Live Support
                        </button>

                        {/* Photier AI Bot Tab */}
                        <button
                            type="button"
                            onClick={() => this.switchTab(false)}
                            style={{
                                flex: 1,
                                padding: '8px 14px',
                                border: 'none',
                                borderRadius: '14px',
                                backgroundColor: !state.humanMode ? '#ffffff' : 'transparent',
                                color: !state.humanMode ? '#1d1d1f' : '#86868b',
                                fontSize: '13px',
                                fontWeight: !state.humanMode ? '600' : '500',
                                cursor: 'pointer',
                                transition: 'all 0.25s ease',
                                boxShadow: !state.humanMode
                                    ? '0 2px 8px rgba(0,0,0,0.12)'
                                    : 'none',
                                whiteSpace: 'nowrap',
                                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                            }}
                        >
                            🤖 Photier AI Bot
                        </button>
                    </div>
                </div>
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

                {/* Working Hours Overlay */}
                {!this.isWithinWorkingHours() && !state.overlayDismissed && state.humanMode && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(252, 252, 252, 0.78)',
                        backdropFilter: 'blur(3px)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        paddingTop: '80px',
                        zIndex: 999,
                        padding: '80px 30px 30px 30px',
                        borderRadius: '12px'
                    }}>
                        <div style={{
                            textAlign: 'center',
                            color: '#1d1d1f',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                        }}>
                            <div style={{
                                fontSize: '48px',
                                marginBottom: '16px'
                            }}>
                                🌙
                            </div>
                            <div style={{
                                fontSize: '18px',
                                fontWeight: '600',
                                marginBottom: '12px',
                                lineHeight: '1.4'
                            }}>
                                Outside Working Hours
                            </div>
                            <div style={{
                                fontSize: '14px',
                                color: '#6e6e73',
                                marginBottom: '24px',
                                lineHeight: '1.5',
                                maxWidth: '280px'
                            }}>
                                But would you like to try your luck? Maybe an assistant is online.
                            </div>
                            <button
                                type="button"
                                onClick={this.dismissOverlay}
                                style={{
                                    padding: '12px 32px',
                                    border: '2px solid #d1d1d6',
                                    borderRadius: '14px',
                                    backgroundColor: 'transparent',
                                    color: '#1d1d1f',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f5f5f7';
                                    e.currentTarget.style.borderColor = '#86868b';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.borderColor = '#d1d1d6';
                                }}
                            >
                                Try Anyway
                            </button>
                        </div>
                    </div>
                )}
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

    toggleHumanMode = () => {
        this.setState({ humanMode: !this.state.humanMode });
    };

    isWithinWorkingHours = () => {
        const conf = this.props.conf;
        if (!conf.workingHours || !conf.workingHours.enabled) {
            return true; // Çalışma saatleri ayarlanmamışsa her zaman açık
        }

        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const currentTime = hours * 60 + minutes;

        const [startHour, startMin] = conf.workingHours.start.split(':').map(Number);
        const [endHour, endMin] = conf.workingHours.end.split(':').map(Number);
        const startTime = startHour * 60 + startMin;
        const endTime = endHour * 60 + endMin;

        return currentTime >= startTime && currentTime < endTime;
    };

    dismissOverlay = () => {
        this.setState({ overlayDismissed: true });
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
                human_mode: this.state.humanMode,
                messageSource: this.state.humanMode ? 'live_support' : 'ai_bot',
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

    // CRITICAL: Write to correct array based on active tab
    writeToMessages = (msg) => {
        msg.time = msg.time ? new Date(msg.time) : new Date();

        // Add to correct array based on active tab
        if (this.state.humanMode) {
            this.humanMessages.push(msg);
            if (store.enabled) {
                try {
                    store.set(this.humanMessagesKey, this.humanMessages);
                } catch (e) {
                    console.log('failed to add message to human localStorage', e);
                    store.set(this.humanMessagesKey, []);
                }
            }
        } else {
            this.aiMessages.push(msg);
            if (store.enabled) {
                try {
                    store.set(this.aiMessagesKey, this.aiMessages);
                } catch (e) {
                    console.log('failed to add message to AI localStorage', e);
                    store.set(this.aiMessagesKey, []);
                }
            }
        }

        // Update display
        this.setState({
            messages: this.state.humanMode ? this.humanMessages : this.aiMessages,
        });
    };
}
