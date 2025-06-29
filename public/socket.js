// Handles all socket.io communication and event wiring
import { addMessage, updateUserList, clearMessages } from './ui.js';

const socket = io();

let myRoomId = null;
let myUsername = null;

// Save roomId and username to sessionStorage
function saveSession(roomId, username) {
  sessionStorage.setItem('minichat_roomId', roomId);
  sessionStorage.setItem('minichat_username', username);
}

// Load roomId and username from sessionStorage
function loadSession() {
  return {
    roomId: sessionStorage.getItem('minichat_roomId'),
    username: sessionStorage.getItem('minichat_username')
  };
}

function getUserId() {
  let userId = sessionStorage.getItem('minichat_userId');
  if (!userId) {
    userId = crypto.randomUUID ? crypto.randomUUID() : ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c=>(c^crypto.getRandomValues(new Uint8Array(1))[0]&15>>c/4).toString(16));
    sessionStorage.setItem('minichat_userId', userId);
  }
  return userId;
}

export function setupSocketHandlers() {
  socket.on('join success', ({ roomId, username }) => {
    myRoomId = roomId;
    myUsername = username;
    saveSession(roomId, username);
    // Update the URL to /roomId without reloading the page
    if (window.location.pathname !== `/${roomId}`) {
      window.history.pushState({}, '', `/${roomId}`);
    }
    // Hide the modal and show main content
    const modal = document.getElementById('room-modal');
    if (modal) {
      modal.classList.remove('show', 'd-flex', 'align-items-center', 'justify-content-center');
      modal.style.display = 'none';
      modal.style.visibility = 'hidden';
      modal.style.position = 'absolute';
      modal.setAttribute('aria-hidden', 'true');
    }
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.classList.remove('d-none');
    }
    clearMessages();
    // Only show 'You joined room:' for myself
    if (username === sessionStorage.getItem('minichat_username')) {
      addMessage({ message: `You joined room: ${roomId}` }, true);
    }
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

export function joinRoom(roomId, username) {
  socket.emit('join room', { roomId, create: false, username, userId: getUserId() });
}

export function createRoom(username) {
  socket.emit('join room', { roomId: '', create: true, username, userId: getUserId() });
}

// On page load, if session exists, auto-join the room
const session = loadSession();
if (session.roomId && session.username) {
  window.addEventListener('DOMContentLoaded', () => {
    // If already on the correct URL, auto-join
    if (window.location.pathname === `/${session.roomId}`) {
      joinRoom(session.roomId, session.username);
    } else {
      // If not, update the URL and auto-join
      window.history.replaceState({}, '', `/${session.roomId}`);
      joinRoom(session.roomId, session.username);
    }
  });
}

export { getUserId };
