import { showModal, addMessage, updateUserList, clearMessages } from './ui.js';
import { setupSocketHandlers, sendMessage, joinRoom, createRoom } from './socket.js';

const form = document.getElementById('chat-form');
const input = document.getElementById('m');

// Room modal logic
const roomForm = document.getElementById('room-form');
const roomIdInput = document.getElementById('room-id');
const createRoomBtn = document.getElementById('create-room');

form.classList.add('d-flex', 'gap-2');
input.classList.add('form-control');
form.querySelector('button').classList.add('btn', 'btn-primary');

roomForm.classList.add('mb-2');
roomIdInput.classList.add('form-control', 'mb-2');
createRoomBtn.classList.add('btn', 'btn-outline-primary', 'me-2');
document.getElementById('join-room').classList.add('btn', 'btn-primary');

let myRoomId = null;

form.addEventListener('submit', function(e) {
  e.preventDefault();
  if (input.value.trim()) {
    sendMessage(input.value);
    input.value = '';
  }
});

roomForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const roomId = roomIdInput.value.trim();
  joinRoom(roomId);
});
createRoomBtn.addEventListener('click', function(e) {
  e.preventDefault();
  createRoom();
});

// Show modal on load
showModal(true);
setupSocketHandlers();

const userList = document.getElementById('user-list');
const toggleUsersBtn = document.getElementById('toggle-users');

if (toggleUsersBtn) {
  toggleUsersBtn.addEventListener('click', () => {
    userList.classList.toggle('collapsed-users');
  });
}

// If URL contains /roomID, auto-fill and auto-join
const urlParts = window.location.pathname.split('/').filter(Boolean);
if (urlParts.length === 1 && urlParts[0] !== '') {
  const roomId = urlParts[0];
  document.getElementById('room-id').value = roomId;
  // Try to join automatically
  window.addEventListener('DOMContentLoaded', () => {
    joinRoom(roomId);
  });
}
