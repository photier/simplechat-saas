import { h, Component } from 'preact';

export default class ArrowIcon extends Component {

    render({isOpened},{}) {
        return (
            <div>
                {/* keyboard arrow up */}
                { (isOpened) ?
                    <svg
                        fill="none"
                        height="18"
                        viewBox="0 0 24 24"
                        width="18"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ display: 'block' }}>
                        <line x1="6" y1="6"
                            x2="18" y2="18"
                            stroke="white"
                            stroke-width="2"
                            stroke-linecap="round"/>
                        <line x1="18" y1="6"
                            x2="6" y2="18"
                            stroke="white"
                            stroke-width="2"
                            stroke-linecap="round"/>
                    </svg>
                    :
                    <svg
                        fill="#FFFFFF"
                        height="24"
                        viewBox="0 0 24 24"
                        width="24"
                        xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.582 13.891c-0.272 0.268-0.709 0.268-0.979 0s-0.271-0.701 0-0.969l7.908-7.83c0.27-0.268 0.707-0.268 0.979 0l7.908 7.83c0.27 0.268 0.27 0.701 0 0.969s-0.709 0.268-0.978 0l-7.42-7.141-7.418 7.141z"></path>
                    </svg>

                }
            </div>
        );
    }
}
