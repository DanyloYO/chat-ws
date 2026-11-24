const pool = require('./database')


class database {
    async createUser(username, password) {
        const result = await pool.query(
            'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
            [username, password]
        );

        return result.rows[0];
    }

    async findUser(username) {
        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );

        return result.rows[0]
    }

    async validateUser(username, password) {
        const user = await this.findUser(username)

        if (!user || user.password !== password) {
            return null
        }

        return user
    }
    async saveMessage(userId, username, text) {
        await pool.query(
            'INSERT INTO messages (user_id, username, text) VALUES ($1, $2, $3)',
            [userId, username, text]
        );
    }

    async getMessages() {
        const result = await pool.query(
            'SELECT * FROM messages ORDER BY created_at DESC LIMIT 50'
        );

        return result.rows.reverse()
}
}

module.exports = new database();