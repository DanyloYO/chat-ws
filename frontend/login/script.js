
const token = localStorage.getItem('token');
if (token) {
    window.location.href = '/chat';
}

async function login() {
    const nickname = document.getElementById('nickname').value.trim();
    const password = document.getElementById('password').value.trim();

    const result = document.getElementById('result');

    if (!nickname || !password) {
        result.textContent = "❌ All fields are required";
        return;
    }

    const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, password })
    });

    const data = await res.json();

    if (data.ok) {
        localStorage.setItem('token', data.token);
        window.location.href = '/chat';
    } else {
        result.textContent = "❌ " + data.msg;
    }
    
}

function goRegister() {
    window.location.href = '/register';
}