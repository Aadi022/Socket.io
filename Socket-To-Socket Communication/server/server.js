//Tutorial for sending message to a specific socket, i.e. communication between specific sockets using the socket id
const express= require("express");
const http= require("http");
const {Server}= require("socket.io");  //Imports server class from Socket.io allowing to create websocket server that works with http server
require("dotenv").config();
const port= process.env.PORT;
const app= express();
const server= http.createServer(app);    //express will do all the http request and response handling, but server is required to integrate with socket.io

const io= new Server(server, {   //creating socket server instance that is attacheedd with http server
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET","POST"]
    }
});

let users= {};  //This does the username->socket.id mapping

io.on("connection",function(socket){
    console.log("Successfully connected to the socket");

    //Client socket provides username and maps username->socket id
    socket.on("register_user", function(username){
        users[username]= socket.id;
        console.log("Registered ",username," with socket id: ",socket.id);
        io.emit("updated_user_list", users);  //Update all the client sockets with the user list
    });

    //Now handle the private message part
    socket.on("private_message", function(to,message,from){ //Now that we have the socket id of the user we have to send to, the data and the user that is sending the message, we send the private message
        const targetSocketId= users[to];
        if(targetSocketId){
            io.to(targetSocketId).emit('receive_private_message',{  //This is the code to send the private message to the specific socket id
                message,
                from
            });
        }
    });

    //Now handling the part where the socket disconnects. Once the socket disconnects, we also delete the username and socket.id from the users object
    socket.on("disconnect", function(){
        console.log("Socket Disconnected with socket id: ",socket.id);
        //now removing the username and socket id from the users object
        for(const [username,id] of Object.entries(users)){
            if(id===socket.id){
                delete users[username];
                break;
            }
        }
        //Now informing all client sockets of the updated users list
        io.emit('updated_user_list',users);
    });

});


server.listen(port, function(){
    console.log("The server is listening on Port ",port);
})

/*
So the flow of code is this->
Suppose there are 2 client sockets-> A and B.
A connects with server socket. The client socket sends A's username to server, and server maps the client username to client socket id. Same happens
with B.Then A selects to message B, and then client A emits to server using event listener 'private_message' along with the parameters which are- to, 
data, from. The server end maps the username(in 'to') to the socket id, and then using that socket id emits data to that client socket. Since the data 
payload has from, so client B can see message has come from A.
*/

/*
Socket.IO allows you to send to only that socket like this:
    io.to(socketId).emit('event_name', data);
*/

/*
So the sending of messages takes place using 2 seperate events:
1) private_message: Used when client wants to send a private message. Client emits it and server listens to it.
2) receive_private_message: Used when server wants to deliver the private message. Server emits it and the target client listens to it.
*/