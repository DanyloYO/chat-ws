const token = localStorage.getItem('token');
if (token) {
    window.location.href = '/chat';
}

const loginForm = document.getElementById('loginForm');
const submitButton = document.querySelector('.auth-submit');
const result = document.getElementById('result');

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    await login();
});

async function login() {
    const nickname = document.getElementById('nickname').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!nickname || !password) {
        setResult('Please fill in both nickname and password.', 'error');
        return;
    }

    setBusy(true);
    setResult('Checking your credentials...', 'loading');

    try {
        const res = await fetch('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nickname, password })
        });

        const data = await res.json();

        if (!res.ok || !data.ok) {
            setResult(data.msg || 'Unable to sign in right now.', 'error');
            return;
        }

        localStorage.setItem('token', data.token);
        setResult('Success. Opening chat...', 'success');
        window.location.href = '/chat';
    } catch (error) {
        setResult('Network error. Please try again in a moment.', 'error');
    } finally {
        setBusy(false);
    }
}

function setBusy(isBusy) {
    submitButton.disabled = isBusy;
    submitButton.textContent = isBusy ? 'Signing In...' : 'Sign In';
}

function setResult(message, state) {
    result.textContent = message;
    result.className = 'status-message';
    if (state) {
        result.classList.add(`is-${state}`);
    }
}
