//the client and server end is basic client and server interaction using sockets
const express= require("express");
const http= require("http");
const {Server}= require("socket.io");  //Imports server class from Socket.io allowing to create websocket server that works with http server
require('dotenv').config();
const port= process.env.PORT;

const app= express();
const server= http.createServer(app);  //express will do all the http request and response handling, but server is required to integrate with socket.io
const io= new Server(server,{   //creating socket server instance that is attacheedd with http server
    cors:{
        origin: "http://localhost:5173",
        methods: ["GET","POST"]
    }
});

//io.on with the event 'connection' is used to connect the client socket with the server socket. Now we write all the socket logic in this block, which means that after client socket gets connected, all socket logic will implement
io.on("connection", function(socket){  //this arguement socket is the client socket that will get connected
    console.log("New client connected: ",socket.id);  //we can acceess the socket's id, from now on we will be working with this socket arguement

    //receiving message from client
    socket.on("send_message",function(data){   //The server socket will listen to client socket when the event is "send_message" from client side as well. 
        console.log("Received message: ",data);   
        socket.emit('receive message',"Server says ",data);
    });

    //Handle disconnection
    socket.on("disconnect", function(){
        console.log("Client Disconnected: ",socket.id);
    });

});

server.listen(port,function(){
    console.log("The server is running on port ",port);
})

//connection and disconnect are built in events

/*
The syntax for socket.emit is (event, data) where the data is the message the socket is sending on the other side
The syntax for socket.on is (event, function) where the function takes in the arguemnet as the data sent by the client
 */


/*
Visulalization of what is happening:

A client connects -> Triggers io.on('connection')
          ⬇
You get their socket object
          ⬇
Inside that block:
    - You listen for their messages
    - You send them responses
    - You handle when they leave
*/