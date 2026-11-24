const token = localStorage.getItem('token');
if (!token) {
    window.location.href = '/login';
}

let payload;
try {
    payload = JSON.parse(decodeTokenPayload(token));
} catch (error) {
    localStorage.removeItem('token');
    window.location.href = '/login';
}

const myId = payload.id;
const messages = document.getElementById('messages');
const usersList = document.getElementById('users');
const input = document.getElementById('messageInput');
const emptyState = document.getElementById('emptyState');
const onlineCount = document.getElementById('onlineCount');
const sessionName = document.getElementById('sessionName');
const connectionStatus = document.getElementById('connectionStatus');
const sendButton = document.querySelector('.send-btn');
const messageForm = document.getElementById('messageForm');

sessionName.textContent = payload.nickname || 'Guest';

const ws = new WebSocket(
    `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}?token=${token}`
);

setConnectionState('connecting', 'Connecting securely...');

ws.addEventListener('open', () => {
    setConnectionState('online', 'Connected. The room is live.');
});

ws.addEventListener('close', () => {
    setConnectionState('offline', 'Connection closed. Refresh or sign in again.');
});

ws.addEventListener('error', () => {
    setConnectionState('offline', 'Unable to reach the chat server right now.');
});

ws.onmessage = (event) => {
    let data;
    try {
        data = JSON.parse(event.data);
    } catch (error) {
        return;
    }

    if (data.type === 'message') {
        addMessage(data.user, data.text, data.userId);
    }

    if (data.type === 'history') {
        messages.innerHTML = '';
        data.messages.forEach((message) => {
            addMessage(message.username, message.text, message.user_id);
        });
        toggleEmptyState();
    }

    if (data.type === 'online') {
        renderOnlineUsers(data.users || []);
    }
};

messageForm.addEventListener('submit', (event) => {
    event.preventDefault();
    sendMessage();
});

function getRandomColor(name) {
    const colors = [
        '#ff8f9d',
        '#ffd36e',
        '#7be7ff',
        '#99ffc8',
        '#9b8cff',
        '#ff94da',
        '#5ab7ff',
        '#9ad7ff'
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
}

function addMessage(user, text, userId) {
    const msg = document.createElement('article');
    msg.classList.add('message');
    msg.classList.add(Number(userId) === Number(myId) ? 'me' : 'other');

    const bubble = document.createElement('div');
    bubble.className = 'bubble';

    const messageHead = document.createElement('div');
    messageHead.className = 'message-head';

    const username = document.createElement('div');
    username.className = 'username';
    username.textContent = user;
    username.style.color = getRandomColor(user);

    const textEl = document.createElement('div');
    textEl.className = 'text';
    textEl.textContent = text;

    const time = document.createElement('div');
    time.className = 'time';
    time.textContent = formatTime(new Date());

    messageHead.appendChild(username);
    bubble.appendChild(messageHead);
    bubble.appendChild(textEl);
    bubble.appendChild(time);

    msg.appendChild(bubble);
    messages.appendChild(msg);

    toggleEmptyState();
    messages.scrollTop = messages.scrollHeight;
}

function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function sendMessage() {
    const text = input.value.trim();
    if (!text || ws.readyState !== WebSocket.OPEN) {
        return;
    }

    ws.send(text);
    input.value = '';
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
}

function decodeTokenPayload(jwtToken) {
    const base64Url = jwtToken.split('.')[1] || '';
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    return atob(padded);
}

function renderOnlineUsers(users) {
    usersList.innerHTML = '';
    onlineCount.textContent = String(users.length);

    if (!users.length) {
        const li = document.createElement('li');
        li.className = 'user-card';
        li.innerHTML = '<div class="user-meta"><strong>No one is online</strong><span>Waiting for the next session.</span></div>';
        usersList.appendChild(li);
        return;
    }

    users.forEach((user) => {
        const li = document.createElement('li');
        li.className = `user-card${user === payload.nickname ? ' is-self' : ''}`;

        const avatar = document.createElement('div');
        avatar.className = 'user-avatar';
        avatar.textContent = user.slice(0, 1).toUpperCase();

        const meta = document.createElement('div');
        meta.className = 'user-meta';

        const name = document.createElement('strong');
        name.textContent = user;

        const description = document.createElement('span');
        description.textContent = user === payload.nickname ? 'You are here now' : 'Live in the room';

        meta.appendChild(name);
        meta.appendChild(description);

        li.appendChild(avatar);
        li.appendChild(meta);
        usersList.appendChild(li);
    });
}

function toggleEmptyState() {
    emptyState.hidden = messages.childElementCount > 0;
}

function setConnectionState(state, text) {
    connectionStatus.dataset.state = state;
    connectionStatus.textContent = text;

    const isReady = state === 'online';
    input.disabled = !isReady;
    sendButton.disabled = !isReady;
}
