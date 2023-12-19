const socket = io('ws://localhost:3500')

const msgInput = document.querySelector('#message')
const nameInput = document.querySelector('#name')
const chatRoom = document.querySelector('#room')
const activity = document.querySelector('.activity')
const usersList = document.querySelector('.user-list')
const roomList = document.querySelector('.room-list')
const chatdisplay = document.querySelector('.chat-display')

function sendMessage(e) {
  e.preventDefault()
  if (msgInput.value && msgInput.value && chatRoom.value) {
    socket.emit('message', {
      name: nameInput.value,
      text: msgInput.value
    })
    msgInput.value = ""
  }
  msgInput.focus()
}

function enterRoom(e) {
  e.preventDefault()
  if (nameInput.value && chatRoom.value) {
    socket.emit('enterRoom', {
      name: nameInput.value,
      room: chatRoom.value,
    })
  }
}

// 確保 DOM 完全加載
document.querySelector('.form-msg').addEventListener('submit', sendMessage);
document.querySelector('.form-join').addEventListener('submit', enterRoom);

msgInput.addEventListener('keypress', () => {
  socket.emit('activity', nameInput.value)
});

socket.on('message', (data) => {
  activity.textContent = ''
  const li = document.createElement('li')
  li.textContent = data
  document.querySelector('ul').appendChild(li) // 確保此時有一個<ul>元素
})


let activityTimer
socket.on('activity', (name) => {
  activity.textContent = `${ name } is typing...`
  // clear timer after 3 sec
  clearTimeout(activityTimer)
  activityTimer = setTimeout(() => {
    activity.textContent = ''
  }, 3000)
})