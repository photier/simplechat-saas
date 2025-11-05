import { h, Component } from 'preact';
import ChatFrame from './chat-frame';
import ChatFloatingButton from './chat-floating-button';
import ChatTitleMsg from './chat-title-msg';
import ArrowIcon from './arrow-icon';
import RefreshIcon from './refresh-icon';
import {
    desktopTitleStyle,
    desktopWrapperStyle,
    mobileOpenWrapperStyle,
    mobileClosedWrapperStyle,
    desktopClosedWrapperStyleChat,
    titleStyle
} from './style';

export default class Widget extends Component {

    constructor() {
        super();
        this.state = {
            isChatOpen: false,
            pristine: true,
            wasChatOpened: this.wasChatOpened()
        };
    }

    render({ conf, isMobile, username }, { isChatOpen, pristine }) {
        console.log('🎨 RENDER - isChatOpen:', isChatOpen, 'pristine:', pristine);

        const wrapperWidth = { width: conf.desktopWidth };
        const desktopHeight = (window.innerHeight - 100 < conf.desktopHeight) ? window.innerHeight : conf.desktopHeight;
        const wrapperHeight = { height: desktopHeight };

        return (
            <div>
                {/*CLOSED STATE*/}
                <div style={{ display: conf.useExternalButton ? 'none' : 'block' }}>
                    <div style={{ display: isChatOpen ? 'none' : 'block' }}>
                        {(isMobile || conf.alwaysUseFloatingButton) ?
                            <div style={mobileClosedWrapperStyle}>
                                <ChatFloatingButton color={conf.mainColor} onClick={this.toggleWidget} />
                            </div>
                            :
                            (conf.closedStyle === 'chat' || this.wasChatOpened()) ?
                                <div style={desktopWrapperStyle}>
                                    <div style={{ background: conf.mainColor, ...desktopTitleStyle }} onClick={this.toggleWidget}>
                                        <div style={titleStyle}>{conf.titleClosed}</div>
                                        <ArrowIcon isOpened={false} />
                                    </div>
                                </div>
                                :
                                <div style={desktopClosedWrapperStyleChat}>
                                    <ChatTitleMsg onClick={this.toggleWidget} conf={conf} />
                                </div>
                        }
                    </div>
                </div>

                {/*OPENED STATE*/}
                <div style={{ display: isChatOpen ? 'block' : 'none' }}>
                    <div style={isMobile ? mobileOpenWrapperStyle : { ...desktopWrapperStyle, ...wrapperWidth, ...wrapperHeight }}>
                        <div style={{ background: conf.mainColor, height: '70px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px', fontFamily: 'Lato, sans-serif', color: '#fff' }}>
                            <div style={{ flex: 1, fontSize: '16px', fontWeight: 500 }} onClick={this.toggleWidget}>{conf.titleOpen}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div
                                    onClick={this.handleRefresh}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s ease',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                                >
                                    <RefreshIcon />
                                </div>
                                <div
                                    onClick={this.toggleWidget}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s ease',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                                >
                                    <ArrowIcon isOpened={true} />
                                </div>
                            </div>
                        </div>
                        {pristine ? null : <ChatFrame {...this.props} />}
                    </div>
                </div>
            </div>
        );
    }

    handleRefresh = (e) => {
        e.stopPropagation();
        
        // iframe'e mesaj gönder
        const iframe = document.querySelector('iframe#intergramChatFrame');
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({ type: 'CLEAR_CHAT' }, '*');
        }
    }

    toggleWidget = () => {
        console.log('🔵 toggleWidget called, current state:', this.state);

        let stateData = {
            isChatOpen: !this.state.isChatOpen,
        }

        // Widget açılıyorsa (kapalıdan açığa geçiş)
        if (!this.state.isChatOpen) {
            stateData.pristine = true; // Önce true yap (iframe unmount)

            if (!this.wasChatOpened()) {
                this.setCookie();
                stateData.wasChatOpened = true;
            }

            // Hemen sonra false yap (iframe mount olsun, register event tetiklensin)
            setTimeout(() => {
                this.setState({ pristine: false });
            }, 10);
        } else {
            // Widget kapatılıyorsa, pristine: true yap (bir sonraki açılışta fresh iframe)
            stateData.pristine = true;
        }

        console.log('🔵 Calling setState with:', stateData);
        this.setState(stateData);
    }


    componentDidMount() {
        document.addEventListener('chatToggled', this.handleChatToggle);
    }

    componentWillUnmount() {
        document.removeEventListener('chatToggled', this.handleChatToggle);
    }

    handleChatToggle = (event) => {
        const chatOpen = event.detail;
        this.setState({
            isChatOpen: chatOpen,
            pristine: false,
        });
    };

    setCookie = () => {
        let date = new Date();
        let expirationTime = parseInt(this.props.conf.cookieExpiration);
        date.setTime(date.getTime() + (expirationTime * 24 * 60 * 60 * 1000));
        let expires = '; expires=' + date.toGMTString();
        document.cookie = 'chatwasopened=1' + expires + '; path=/';
    }

    getCookie = () => {
        var nameEQ = 'chatwasopened=';
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return false;
    }

    wasChatOpened = () => {
        return (this.getCookie() === false) ? false : true;
    }

}
