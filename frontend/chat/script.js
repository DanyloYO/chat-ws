const token = localStorage.getItem('token')
if (!token) window.location.href = '/login'

const payload = JSON.parse(atob(token.split('.')[1]))
const myId = payload.id

const ws = new WebSocket(
  `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}?token=${token}`
);
//Тернарный оператор if (https) - wss else ws
const messages = document.getElementById('messages')
const usersList = document.getElementById('users')
const input = document.getElementById('messageInput')

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'message') {
        addMessage(data.user, data.text, data.userId);
    }

    if (data.type === 'history') {
        messages.innerHTML = '';
        data.messages.forEach(msg => {
            addMessage(msg.username, msg.text, msg.user_id);
        });
    }

    if (data.type === 'online') {
        usersList.innerHTML = '';
        data.users.forEach(user => {
            const li = document.createElement('li');
            li.textContent = user;
            usersList.appendChild(li);
        });
    }
};

function getRandomColor(name) {
    const colors = [
        "#ff6b6b",
        "#feca57",
        "#48dbfb",
        "#1dd1a1",
        "#5f27cd",
        "#ff9ff3",
        "#54a0ff",
        "#00d2d3"
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
}

function addMessage(user, text, userId) {
    const msg = document.createElement('div');
    msg.classList.add('message');
    msg.classList.add(Number(userId) === Number(myId) ? 'me' : 'other');

    const bubble = document.createElement('div');
    bubble.className = 'bubble';

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

    bubble.appendChild(username);
    bubble.appendChild(textEl);
    bubble.appendChild(time);

    msg.appendChild(bubble);
    messages.appendChild(msg);

    messages.scrollTop = messages.scrollHeight;
}
function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    ws.send(text);
    input.value = '';
}

input.addEventListener('keypress', e => {
    if (e.key === 'Enter') sendMessage();
});

function logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
}