const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const mongoose = require('mongoose');

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

  socket.on('user login', (username) => {
    socket.username = username;
  });

  socket.on('chat message', (msg) => {
    const message = new Message({ username: socket.username, message: msg.message });
    message.save().then(() => {
      io.emit('chat message', { username: socket.username, message: msg.message });
    });
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log('listening on *:' + (process.env.PORT || 3000));
});
