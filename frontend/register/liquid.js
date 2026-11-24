const token = localStorage.getItem('token');
if (token) {
    window.location.href = '/chat';
}

const registerForm = document.getElementById('registerForm');
const submitButton = document.querySelector('.auth-submit');
const result = document.getElementById('result');

registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    await register();
});

async function register() {
    const nickname = document.getElementById('nickname').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();

    if (!nickname || !password || !confirmPassword) {
        setResult('Please complete all fields before continuing.', 'error');
        return;
    }

    if (password !== confirmPassword) {
        setResult('Passwords do not match.', 'error');
        return;
    }

    setBusy(true);
    setResult('Creating your account...', 'loading');

    try {
        const registerResponse = await fetch('/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nickname, password })
        });
        const registerData = await registerResponse.json();

        if (!registerResponse.ok || !registerData.ok) {
            setResult(registerData.msg || 'Unable to create account right now.', 'error');
            return;
        }

        setResult('Account created. Signing you in...', 'loading');

        const loginResponse = await fetch('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nickname, password })
        });
        const loginData = await loginResponse.json();

        if (!loginResponse.ok || !loginData.ok) {
            setResult('Account created. Please sign in manually.', 'success');
            window.location.href = '/login';
            return;
        }

        localStorage.setItem('token', loginData.token);
        setResult('Welcome inside. Launching chat...', 'success');
        window.location.href = '/chat';
    } catch (error) {
        setResult('Network error. Please try again in a moment.', 'error');
    } finally {
        setBusy(false);
    }
}

function setBusy(isBusy) {
    submitButton.disabled = isBusy;
    submitButton.textContent = isBusy ? 'Creating...' : 'Create Account';
}

function setResult(message, state) {
    result.textContent = message;
    result.className = 'status-message';
    if (state) {
        result.classList.add(`is-${state}`);
    }
}
