// Handles all DOM manipulation and UI updates
export function showModal(show) {
  const roomModal = document.getElementById('room-modal');
  const container = document.querySelector('.container');
  roomModal.style.display = show ? 'block' : 'none';
  container.style.display = show ? 'none' : 'flex';
}

export function addMessage({ username, message, timestamp }, isSystem = false) {
  const messages = document.getElementById('messages');
  const div = document.createElement('div');
  div.className = 'message' + (isSystem ? ' system' : '');
  if (isSystem) {
    div.textContent = message;
  } else {
    div.innerHTML = `<span class="meta">[${timestamp}] ${username}:</span> ${message}`;
  }
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

export function updateUserList(users) {
  const usersList = document.getElementById('users');
  usersList.innerHTML = '';
  users.forEach(user => {
    const li = document.createElement('li');
    li.textContent = user;
    usersList.appendChild(li);
  });
}

export function clearMessages() {
  const messages = document.getElementById('messages');
  messages.innerHTML = '';
}
