//Thistut
const express= require("express");
const app= express();
const http= require("http");
const {Server}= require("socket.io");
require("dotenv").config();
const port= process.env.PORT;
const server= http.createServer(app);

const io= new Server(server,{
    cors: {
        origin: "http//localhost:5173",
        methods: ["GET","POST"]
    }
});

const chatNamespace= io.of("/chat");

chatNamespace.on("connection", function(socket){
    console.log("User connected to chat socket with the socket id ",socket.id);

    //join a room
    socket.on("join_room", function(roomname){  //using the event join_room, the client socket can join the room with the given roomname
        socket.join(roomname);
        console.log(socket.id," has join the room ",roomname);
        //Notify all the other client sockets 
        socket.to(roomname).emit("user_joined",`${socket.id} has joined room ${roomname}`);
    });

    //Once joined, handle messages in the room
    socket.on("send_room_message", function(room,message){  //This listens for an event "send_room_message" from the client. This has two parameters- room name and message given.
        console.log("Message in room ",room," from ",socket.id," : ",message);
        chatNamespace.to(room).emit("recieve_room_message",{sender: socket.id, message: message});  //Once the server receives the message from the client, it broadcasts to the rest of the client sockets in the same room.
    });

    //leave room event
    socket.on('leave_room', (roomName) => {
        socket.leave(roomName);
        console.log(` ${socket.id} left room: ${roomName}`);
        socket.to(roomName).emit('user_left', `${socket.id} left ${roomName}`);
    });

    socket.on("disconnect", function(){
        console.log("/chat socket disconnected with the socket id: ",socket.id);
    });
});

server.listen(port, function(){
    console.log("The server is running on port ",port);
})



//Always and always remember, in a socket-based chat application, the server first listens for the message from sender client socket, and then emits to the receiver client socket. So always and always there is a first .on and then a .emit


