# Chat WS

A real-time chat in the browser. You register, log in, and talk with everyone
who is online. Messages go through WebSockets, and the last 50 are stored in
PostgreSQL, so new users see the history when they join.

## What it does

- **Register and log in** with a nickname and password. Passwords are hashed
  with bcrypt, and login returns a JWT.
- **Live chat over WebSocket.** The socket only accepts a connection with a
  valid token, so you have to be logged in to chat.
- **Who is online.** The server keeps a list of connected users and sends it to
  everyone when someone joins or leaves.
- **Message history.** Every message is saved in PostgreSQL. A new connection
  gets the last 50 messages first.
- **Telegram notification** to the admin when a new user registers.

## Tech

- Backend: Node.js, Express, `ws`, PostgreSQL (`pg`), bcrypt, jsonwebtoken
- Frontend: plain HTML, CSS and JavaScript
- Telegram Bot API for admin notifications

I wrote the backend myself. The newer "liquid" design of the pages was made
with help from AI.

## Run it

You need Node.js and a running PostgreSQL.

```bash
cd backend
npm install
cp config.example.js config.js   # fill in the JWT secret, bot token and database
node server.js
```

Open http://localhost:6969. The tables are created automatically on start.

## Project layout

```
backend/
  server.js             Express + WebSocket server
  routes/auth.js        register and login
  routes/validator.js   checks nickname and password
  routes/botTG.js       Telegram notification
  database/             PostgreSQL pool, tables, queries
  middleware/           JWT checks
frontend/
  login/ register/ chat/   pages (plain version and "liquid" design)
```

`backend/config.js` is git-ignored, so no secrets end up in the repo.
