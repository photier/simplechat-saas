export const desktopWrapperStyle = {
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    top: 'auto',
    left: 'auto',
    zIndex: 999999,
    borderRadius: '20px',
    background: 'rgb(229, 229, 229)',
    boxSizing: 'content-box',
    boxShadow: '0px 0px 30px rgba(0, 0, 0, 0.5)',
    overflow: 'hidden'
};
export const desktopClosedWrapperStyleChat = {
    position: 'fixed',
    bottom: '0px',
    right: '0px',
    top: 'auto',
    left: 'auto',
    zIndex: 999999,
    minWidth: '400px',
    boxSizing: 'content-box',
    overflow: 'hidden',
    minHeight: '120px'
};
export const mobileClosedWrapperStyle = {
    position: 'fixed',
    bottom: 18,
    right: 18,
    top: 'auto',
    left: 'auto',
    zIndex: 999999,
    borderRadius: '50%',
    background: 'rgb(229, 229, 229)',
    boxSizing: 'content-box'
};
export const mobileOpenWrapperStyle = {
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 999999,
    width: '100%',
    height: '100%',
    background: 'rgb(229, 229, 229)',
    overflowY: 'visible',
    boxSizing: 'content-box'
};
export const desktopTitleStyle = {
    height: '80px',
    lineHeight: '70px',
    fontSize: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    padding: '5px 0 5px 20px',
    fontFamily: 'Lato, sans-serif',
    color: '#fff',
    cursor: 'pointer',
};
export const mobileTitleStyle = {
    height: 60,
    width: 60,
    cursor: 'pointer',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    webkitBoxShadow: '1px 1px 4px rgba(101,119,134,.75)',
    boxShadow: '1px 1px 4px rgba(101,119,134,.75)'
};
export const titleStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '0'
};
