const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const rooms = {};
// Structure: rooms[roomId] = { users: { [userId]: { username, sockets: Set } } }

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
  let userId;

  socket.on('join room', ({ roomId, create, username: providedUsername, userId: providedUserId }) => {
    if (create) {
      // Create a new room
      roomId = generateRoomId();
      rooms[roomId] = { users: {} };
    }
    if (!roomId || !rooms[roomId]) {
      socket.emit('join error', 'Room does not exist.');
      return;
    }
    // Use provided username or generate random
    username = (providedUsername && providedUsername.trim()) ? providedUsername.trim() : getRandomUsername();
    userId = providedUserId || socket.id;
    currentRoom = roomId;
    if (!rooms[roomId].users[userId]) {
      rooms[roomId].users[userId] = { username, sockets: new Set(), entered: false };
      socket.join(roomId);
      rooms[roomId].users[userId].sockets.add(socket.id);
      socket.emit('join success', { roomId, username });
      io.to(roomId).emit('user list', Object.values(rooms[roomId].users).map(u => u.username));
      // Only emit join message if this is a new user, not a refresh
      if (!providedUserId) {
        socket.to(roomId).emit('system message', `${username} joined the chat.`);
      }
      // Emit 'entered the chat' only the first time this userId enters this room
      if (!rooms[roomId].users[userId].entered) {
        rooms[roomId].users[userId].entered = true;
        socket.to(roomId).emit('system message', `${username} entered the chat.`);
      }
    } else {
      // User already exists in room (refresh or reconnect)
      rooms[roomId].users[userId].sockets.add(socket.id);
      socket.join(roomId);
      socket.emit('join success', { roomId, username });
      io.to(roomId).emit('user list', Object.values(rooms[roomId].users).map(u => u.username));
    }
  });

  socket.on('chat message', (msg) => {
    if (!currentRoom || !rooms[currentRoom]) return;
    const timestamp = new Date().toLocaleTimeString();
    // Find userId for this socket
    let userEntry = Object.entries(rooms[currentRoom].users).find(([uid, u]) => u.sockets.has(socket.id));
    let sender = userEntry ? userEntry[1].username : username;
    io.to(currentRoom).emit('chat message', {
      username: sender,
      message: msg,
      timestamp
    });
  });

  socket.on('disconnect', () => {
    if (!currentRoom || !rooms[currentRoom]) return;
    // Find userId for this socket
    let userEntry = Object.entries(rooms[currentRoom].users).find(([uid, u]) => u.sockets.has(socket.id));
    if (!userEntry) return;
    let [uid, userObj] = userEntry;
    userObj.sockets.delete(socket.id);
    if (userObj.sockets.size === 0) {
      // All sockets for this user are gone
      socket.to(currentRoom).emit('system message', `${userObj.username} left the chat.`);
      delete rooms[currentRoom].users[uid];
      io.to(currentRoom).emit('user list', Object.values(rooms[currentRoom].users).map(u => u.username));
      // Clean up empty room
      if (Object.keys(rooms[currentRoom].users).length === 0) {
        delete rooms[currentRoom];
      }
    } else {
      // User still has other sockets in the room (e.g., refresh)
      io.to(currentRoom).emit('user list', Object.values(rooms[currentRoom].users).map(u => u.username));
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
