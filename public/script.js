import { showModal, copyRoomUrlToClipboard } from './ui.js';
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
  const username = document.getElementById('user-name').value.trim();
  joinRoom(roomId, username);
});
createRoomBtn.addEventListener('click', function(e) {
  e.preventDefault();
  const username = document.getElementById('user-name').value.trim();
  createRoom(username);
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

// Try to restore session from sessionStorage
const session = (function() {
  try {
    return {
      roomId: sessionStorage.getItem('minichat_roomId'),
      username: sessionStorage.getItem('minichat_username')
    };
  } catch { return {}; }
})();

const urlParts = window.location.pathname.split('/').filter(Boolean);
if (session.roomId && session.username && urlParts.length === 1 && urlParts[0] !== '' && session.roomId !== urlParts[0]) {
  // If URL roomId is different from cached, clear cache
  sessionStorage.removeItem('minichat_roomId');
  sessionStorage.removeItem('minichat_username');
}

if (session.roomId && session.username && (!urlParts.length || urlParts[0] === session.roomId)) {
  // If session exists and matches URL (or no room in URL), auto-join room with saved username
  window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('room-id').value = session.roomId;
    document.getElementById('user-name').value = session.username;
    joinRoom(session.roomId, session.username);
  });
} else if (urlParts.length === 1 && urlParts[0] !== '') {
  // If URL contains /roomID, pre-fill but do NOT auto-join. Show modal and require user to enter name and submit.
  const roomId = urlParts[0];
  document.getElementById('room-id').value = roomId;
  // Show modal and focus username input
  window.addEventListener('DOMContentLoaded', () => {
    const userNameInput = document.getElementById('user-name');
    if (userNameInput) userNameInput.focus();
    const modal = document.getElementById('room-modal');
    if (modal) {
      modal.classList.add('show', 'd-flex', 'align-items-center', 'justify-content-center');
      modal.style.display = 'flex';
      modal.style.visibility = '';
      modal.style.position = '';
      modal.setAttribute('aria-hidden', 'false');
    }
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.classList.add('d-none');
    }
  });
}

// Share Room Link button logic
const shareLinkBtn = document.getElementById('share-link-btn');
if (shareLinkBtn) {
  const buttonText = shareLinkBtn.innerHTML;
  shareLinkBtn.addEventListener('click', () => {
    // Try to get current roomId from sessionStorage or URL
    let roomId = sessionStorage.getItem('minichat_roomId');
    if (!roomId) {
      // Try to get from URL
      const urlParts = window.location.pathname.split('/').filter(Boolean);
      if (urlParts.length === 1 && urlParts[0] !== '') {
        roomId = urlParts[0];
      }
    }
    if (roomId) {
      copyRoomUrlToClipboard(roomId);
      shareLinkBtn.textContent = 'Copied!';
      setTimeout(() => {
        shareLinkBtn.innerHTML = buttonText;
      }, 1200);
    }
  });
}
