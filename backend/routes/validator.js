function validateRegister({ nickname, password }) {
    if (!nickname || !password) {
        return "All fields are required"
    }

    if (nickname.includes(" ")) {
        return "Nickname cannot contain spaces"
    }

    if (nickname.length < 3) {
        return "Nickname must be 3 or more characters"
    }
    const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{5,}$/

    if (!passwordRegex.test(password)) {
        return "Password must be at least 8 characters and contain letters and numbers"
    }
    if (password.length < 5 || password.length > 33) {
        return "Password must be between 5 and 33 characters"
    }

    return null
}

module.exports = {
    validateRegister
}