import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// open db
const db = await open({
  filename : 'chat.db',
  driver: sqlite3.Database,
});

// create our messages
await db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_offset TEXT UNIQUE,
  context TEXT,
  );
`);

const app = express();
const PORT = 3000;
const server = createServer(app);
const io = new Server(server, {
  connectionStateRecovery: {}
});

const __dirname = dirname(fileURLToPath(import.meta.url));



app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
  socket.on('chat message', async (msg) => {
    let result;
    try {
      result = await db.run('INSERT INTO messages (content) VALUES (?)', msg);
    } catch (e) {
      return;
    }
    io.emit('chat message', msg);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`); 
});
