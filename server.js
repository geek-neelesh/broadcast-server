const express = require('express');
const http = require('http');
const {Server} = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server)

app.use(express.static(path.join(__dirname,"public")));

let clients = [];
io.on('connection',(socket)=>{
    console.log('A user connected:', socket.id);
    clients.push(socket);

    socket.on('message', (msg) => {
        socket.broadcast.emit('message',  { sender: socket.id, message: msg }); 
      });

    socket.on('disconnect', () => {
        clients = clients.filter((client) => client.id !== socket.id);
        console.log(`Client disconnected: ${socket.id}`);
      });

})

app.get('/',(req,res)=>{
    res.sendFile();

})

server.listen(3000, () => {
    console.log("Broadcast server running on http://localhost:3000");
  });

const shutdown = () => {
    console.log('\nShutting down server gracefully...');
    server.close(() => {
      console.log('HTTP server closed.');
      clients.forEach((client) => client.disconnect(true));
      process.exit(0);
    });
  
    setTimeout(() => {
      console.error('Forced shutdown.');
      process.exit(1);
    }, 10000);
  };
  
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  

