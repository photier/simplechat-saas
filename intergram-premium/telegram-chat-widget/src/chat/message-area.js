import dateFormat from 'dateformat'
import { h, Component } from 'preact';

const dayInMillis = 60 * 60 * 24 * 1000;

function parseMarkdown(text) {
    if (!text || text.trim().length === 0) return '';
    
    let lines = text.split('\n');
    let html = '';
    let inList = false;

    lines.forEach(line => {
        if (line.trim().match(/^[-*]\s/)) {
            if (!inList) {
                html += '<ul>';
                inList = true;
            }
            let listItem = line.trim().replace(/^[-*]\s/, '');
            listItem = listItem
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/`(.*?)`/g, '<code>$1</code>')
                .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
            html += '<li>' + listItem + '</li>';
        } else {
            if (inList) {
                html += '</ul>';
                inList = false;
            }
            if (line.trim()) {
                let parsed = line
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/`(.*?)`/g, '<code>$1</code>')
                    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
                html += parsed + '<br />';
            } else {
                html += '<br />';
            }
        }
    });

    if (inList) {
        html += '</ul>';
    }

    return html;
}

export default class MessageArea extends Component {
    scrollToBottom() {
        if (this.chat && 'scrollTo' in this.chat) {
            this.chat.scrollTo({
                top: this.chat.scrollHeight - this.chat.clientHeight,
                behavior: 'smooth',
            });
        } else {
            this.chat.scrollTop = this.chat.scrollHeight - this.chat.clientHeight;
        }
    }

    focus() {
        this.chat.focus();
    }

    componentDidMount() {
        this.scrollToBottom();
        this.focus();
    }

    componentDidUpdate() {
        this.scrollToBottom();
        this.focus();
    }

    render(props, {}) {
        const currentTime = new Date();
        
        return (
            <div class="chat" ref={(el) => { this.chat = el; }}>
                {props.messages
                    .filter(msg => msg.text && msg.text.trim().length > 0)
                    .map(({ name, text, from, time }) => {
                        return (
                            <div class={'chat-message ' + from}>
                                <div class="msg">
                                    <p dangerouslySetInnerHTML={{
                                        __html: parseMarkdown(text)
                                    }}></p>
                                    {(props.conf.displayMessageTime) ?
                                        <div class="time">
                                            {
                                                currentTime - new Date(time) < dayInMillis ?
                                                    dateFormat(time, 'HH:MM') :
                                                    dateFormat(time, 'm/d/yy HH:MM')
                                            }
                                        </div>
                                        :
                                        ''
                                    }
                                </div>
                            </div>
                        );
                    })}
            </div>
        );
    }
}
