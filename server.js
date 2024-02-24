const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const mongoose = require('mongoose');
const session = require('express-session');
const sharedsession = require("express-socket.io-session");

var sessionMiddleware = session({
  secret: "your-secret-key",
  resave: false,
  saveUninitialized: true,
});

app.use(sessionMiddleware);

io.use(sharedsession(sessionMiddleware, {
  autoSave: true
}));

mongoose.connect(process.env.MONGODB_URI);

const messageSchema = new mongoose.Schema({
  username: String,
  message: String
});

const Message = mongoose.model('Message', messageSchema);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  Message.find().then(messages => {
    socket.emit('load messages', messages);
  });

  socket.on('user login', (username, password) => {
    if (password === 'your-security-code') {
      socket.handshake.session.isLoggedIn = true;
      socket.handshake.session.username = username;
      socket.handshake.session.save();
      socket.emit('login success');
    } else {
      socket.emit('login failure');
    }
  });

  socket.on('chat message', (msg) => {
    if (!socket.handshake.session.isLoggedIn) {
      socket.emit('login required');
      return;
    }
    const message = new Message({ username: socket.handshake.session.username, message: msg });
    message.save().then(() => {
      io.emit('chat message', { username: socket.handshake.session.username, message: msg });
    });
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log('listening on *:' + (process.env.PORT || 3000));
});
