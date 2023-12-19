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

const UserState = {
  users: [],
  setUsers: function (newUsersArray) {
    this.users = newUsersArray
  }
}

io.on('connection', socket => {
  console.log('socket connection id', socket.id)
  // only to user connecting in
  socket.emit('message', 'welcom to chat!')
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

