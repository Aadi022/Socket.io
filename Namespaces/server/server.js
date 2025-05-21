//This tut is about using namespaces. Namespaces are like routes in websockets, for eg /chat deals with only chat based functionality and chat based event listeners.
//Namespaces also implement an added security layer.
const express= require("express");
const http= require("http");
const {Server}= require("socket.io");
const app= express();
const server= http.createServer(app);
require("dotenv").config();
const port= process.env.PORT;
const io= new Server(server,{
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET","POST"]
    }
});

// Default namespace (/)
io.on("connection", function(socket){
    console.log("New user connected for default socket: ",socket.id);
    socket.on("default_message", function(msg){
        console.log("Message received :", msg);
    })

    socket.on("disconnect",function(){
        console.log("Deafult User disconnected: ",socket.id);
    });
});


//Now creating a namespace for chat(/chat). This will take care of all the chat related events
const chatNamespace= io.of("/chat");

chatNamespace.on("connection", function(socket){
    console.log("New user connected for chat socket: ",socket.id);

    socket.on("chat_message", function(msg){
        console.log("Message received by chat socket-client: ",msg);
        chatNamespace.emit("chat_message",msg);  //broadcasting to all client sockets connected to the chat namespace
    })

    socket.on("disconnect", function(){
        console.log("Chat user disconnected with socket id: ",socket.id);
    });
});

//Now creating a namespace for admin(/admin). It will take care of all the admin based functionalities and events.
const adminNamespace= io.of("/admin");

adminNamespace.on("connection", function(socket){
    console.log("Admin socket connected with the socket id of: ", socket.id);
    socket.on("admin_alert", function(data){
        console.log("Admin has alreted: ",data);
        adminNamespace.emit("admin_alert",data);
    });

    socket.on("disconnect", function(){
        console.log("Admin disconnected with the socket id: ",socket.id);
    });
});


server.listen(port, function(){
    console.log("The server is listening on port ",port);
})

//In namespace, io is replaced by the name of the namespace
//Only the socket client connected to the chat namespace can have access to event listeners in the chat namespace, like chat_message