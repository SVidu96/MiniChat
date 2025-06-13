// Handles all socket.io communication and event wiring
import { showModal, addMessage, updateUserList, clearMessages } from './ui.js';

const socket = io();

let myRoomId = null;
let myUsername = null;

export function setupSocketHandlers() {
  socket.on('join success', ({ roomId, username }) => {
    myRoomId = roomId;
    myUsername = username;
    showModal(false);
    clearMessages();
    addMessage({ message: `You joined room: ${roomId}` }, true);
    document.getElementById('room-error').textContent = '';
  });

  socket.on('join error', (msg) => {
    document.getElementById('room-error').textContent = msg;
  });

  socket.on('chat message', (data) => {
    addMessage(data);
  });

  socket.on('system message', (msg) => {
    addMessage({ message: msg }, true);
  });

  socket.on('user list', (users) => {
    updateUserList(users);
  });
}

export function sendMessage(msg) {
  if (msg && myRoomId) {
    socket.emit('chat message', msg);
  }
}

export function joinRoom(roomId) {
  socket.emit('join room', { roomId, create: false });
}

export function createRoom() {
  socket.emit('join room', { roomId: '', create: true });
}
