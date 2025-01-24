const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

mongoose.connect('mongodb://localhost:27017/collabEditor', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const documentSchema = new mongoose.Schema({
  content: String,
});

const Document = mongoose.model('Document', documentSchema);

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('joinDocument', async (docId) => {
    const document = await Document.findById(docId);
    socket.join(docId);
    socket.emit('loadDocument', document.content);

    socket.on('editDocument', async (content) => {
      await Document.findByIdAndUpdate(docId, { content });
      socket.to(docId).emit('documentUpdated', content);
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(4000, () => {
  console.log('Server is running on port 4000');
});
