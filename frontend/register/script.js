const token = localStorage.getItem('token');
if (token) {
    window.location.href = '/chat';
}

async function register() {
    const nickname = document.getElementById('nickname').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    const result = document.getElementById('result');

    if (password !== confirmPassword) {
        result.textContent = "❌ Passwords do not match";
        return;
    }
    const res = await fetch('/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nickname, password })
    });
    const data = await res.json();

    if (data.ok) {
        result.textContent = "✅ Registration successful";
        window.location = "/chat"
    } else {
        result.textContent = "❌ " + data.msg;
    }
}
