import express from 'express'
import {Server} from 'socket.io';
import path from 'path'
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = process.env.PORT || 3500
const ADMIN = 'admin'
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

const expressServer = app.listen(PORT, () => console.log('listening', PORT))
const io = new Server(expressServer, {
  cors: {
    origin: process.env.NODE_ENV === "production" ? false : [ "http://localhost:5500", "http://127.0.0.1:5500" ],
  }
});

const UsersState = {
  users: [],
  setUsers: function (newUsersArray) {
    this.users = newUsersArray
  }
}

io.on('connection', socket => {
  console.log('socket connection id', socket.id)
  // only to user connecting in
  socket.emit('message', buildMsg(ADMIN, 'Welcome'))
  socket.on('enterRoom', ({name, room}) => {
    //leave previous room
    const prevRoom = getUser(socket.id)?.room
    if (prevRoom) {
      socket.leave(prevRoom)
      io.to(prevRoom).emit('message', buildMsg(ADMIN, `${ name } has left`))
    }

    const user = activateUser(socket.id, name, room)
    if (prevRoom)
      io.to(prevRoom).emit('userList', {
        users: getUsersInRoom(prevRoom)
      })
  })
  // to all others
  socket.broadcast.emit('message', `${ socket.id } connected`)
  // listening for a message event
  socket.on('message', data => {
    console.log(data)
    io.emit('message', `${ socket.id.substring(0, 5) }: ${ data }`)
  })

  // when user dissconnect - to all others
  socket.on('dissconnect', () => {
    socket.broadcast.emit('message', `${ socket.id } connected`)
  })

  // listening for activity
  socket.on('activity', (name) => {
    socket.broadcast.emit('activity', name)
  })
})


function buildMsg(name, text) {
  return {
    name,
    text,
    time: new Intl.DateTimeFormat('default', {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    }).format(new Date())
  }
}

function activateUser(id, name, room) {
  const user = {id, name, room}
  UsersState.setUsers([
    ...UsersState.users.filter(user = user.id !== id),
    user
  ])
  return user
}

function userLeavesApp(id) {
  UsersState.setUsers(
    UsersState.users.filter(user => user.id !== id))
}

function getUsersInRoom(room) {
  return UsersState.users.filter(user => user.room === room)
}

function getAllActiveRooms() {
  return Array.from(new Set(UsersState.users.map(user =>
    user.room)))
}