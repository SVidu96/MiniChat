// Handles all DOM manipulation and UI updates
export function showModal(show) {
  const roomModal = document.getElementById('room-modal');
  const mainContent = document.getElementById('main-content');
  if (show) {
    roomModal.classList.add('show');
    roomModal.style.display = 'flex';
    mainContent.classList.add('d-none');
  } else {
    roomModal.classList.remove('show');
    roomModal.style.display = 'none';
    mainContent.classList.remove('d-none');
    mainContent.classList.add('d-flex');
  }
}

export function addMessage({ username, message, timestamp }, isSystem = false) {
  const messages = document.getElementById('messages');
  const div = document.createElement('div');
  const timeDiv = document.createElement('div');
  // Determine if this is my own message
  const isMine = username && username === window.sessionStorage.getItem('minichat_username');
  if (isSystem) {
    // Center and style system messages (join/left/entered)
    div.className = 'text-center text-secondary small my-2';
    div.style.fontSize = '0.95em';
    div.style.opacity = '0.85';
    div.textContent = message;
  } else if (isMine) {
    div.className = 'border rounded p-2 mb-2 bg-primary text-white ms-auto text-end';
    div.style.maxWidth = 'max-content';
    div.innerHTML = `<strong class="me-1">${username}:</strong> ${message}`;
    timeDiv.className = 'text-light small me-2';
    timeDiv.textContent = timestamp + "ss";

  } else {
    div.className = 'border rounded p-2 mb-2 bg-white text-start';
    div.style.maxWidth = 'max-content';
    div.innerHTML = `<strong class="me-1">${username}:</strong> ${message}<br/><span class="text-secondary small me-2">[${timestamp}]</span>`;
  }

  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

export function updateUserList(users) {
  const usersList = document.getElementById('users');
  usersList.innerHTML = '';
  users.forEach(user => {
    const li = document.createElement('li');
    li.className = 'mb-2 px-2 py-1 rounded bg-secondary bg-opacity-10';
    li.textContent = user.username ? user.username : user;
    usersList.appendChild(li);
  });
}

export function clearMessages() {
  const messages = document.getElementById('messages');
  messages.innerHTML = '';
}

export function copyRoomUrlToClipboard(roomId) {
  const url = window.location.origin + '/' + roomId;
  navigator.clipboard.writeText(url);
}
