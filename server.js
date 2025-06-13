const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const rooms = {};

function getRandomUsername() {
  return 'Guest_' + Math.floor(1000 + Math.random() * 9000);
}

function generateRoomId() {
  return Math.random().toString(36).substr(2, 8);
}

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Room ID route: serve index.html for /:roomId
app.get('/:roomId', (req, res, next) => {
  // Only serve for non-file requests (no dot in path)
  if (!req.params.roomId.includes('.')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    next();
  }
});

io.on('connection', (socket) => {
  let username;
  let currentRoom;

  socket.on('join room', ({ roomId, create }) => {
    if (create) {
      // Create a new room
      roomId = generateRoomId();
      rooms[roomId] = { users: {} };
    }
    if (!roomId || !rooms[roomId]) {
      socket.emit('join error', 'Room does not exist.');
      return;
    }
    username = getRandomUsername();
    currentRoom = roomId;
    rooms[roomId].users[socket.id] = username;
    socket.join(roomId);
    socket.emit('join success', { roomId, username });
    io.to(roomId).emit('user list', Object.values(rooms[roomId].users));
    socket.to(roomId).emit('system message', `${username} joined the chat.`);
  });

  socket.on('chat message', (msg) => {
    if (!currentRoom || !rooms[currentRoom]) return;
    const timestamp = new Date().toLocaleTimeString();
    io.to(currentRoom).emit('chat message', {
      username,
      message: msg,
      timestamp
    });
  });

  socket.on('disconnect', () => {
    if (currentRoom && rooms[currentRoom] && rooms[currentRoom].users[socket.id]) {
      socket.to(currentRoom).emit('system message', `${rooms[currentRoom].users[socket.id]} left the chat.`);
      delete rooms[currentRoom].users[socket.id];
      io.to(currentRoom).emit('user list', Object.values(rooms[currentRoom].users));
      // Clean up empty room
      if (Object.keys(rooms[currentRoom].users).length === 0) {
        delete rooms[currentRoom];
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
