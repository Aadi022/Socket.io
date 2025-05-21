import React, {useState, useEffect} from 'react';
import {io} from 'socket.io-client';

const defaultSocket= io("http://localhost:3000");  //client socket for default namespace /
const chatSocket= io("http://localhost:3000/chat"); //client socket for chat namespace /chat
const adminSocket= io("http://localhost:3000/admin");  //client socket for admin namespace /admin


function App() {
  const [chatMessage, setChatMessage]= useState("");  //This state variable will be used to store the message to be sent through the chatSocket
  const [adminAlert, setAdminAlert]= useState("");  //This state variable will be used to store the data to send through the adminSocket

  useEffect(function(){
    //default namespace listener
    defaultSocket.on("connect", function(){
      console.log("Successfully connected to default namespace");
    })
    //Chat namespace listener
    chatSocket.on("chat_message", function(msg){
      console.log("The message sent by server socket is: ",msg);
    });
    //Admin namespace listener
    adminSocket.on("admin_alert", function(data){
      console.log("Admin alert: ",data);
    });

    /*
    return function(){
      defaultSocket.off();  //.disconnect closes the entire socket connection when component is unmounting/ leaving. socket.off() us used just to stop listening to an event.
      chatSocket.off();
      adminSocket.off();
    }
    */
  },[]);

  const sendDefaultMessage= function sendDefaultMessage(){
    defaultSocket.emit("default_message", "Hello from default namespace client");
  };

  const sendChatMessage= function sendChatMessage(){
    chatSocket.emit("chat_message",chatMessage);
  };

  const sendAdminAlert= function sendAdminAlert(){
    adminSocket.emit("admin_alert",adminAlert);
  };

  return (
    <>
        <div style={{ padding: 20 }}>
            <h2>Socket.IO Namespaces Example</h2>

            <button onClick={sendDefaultMessage}>Send Default Message</button>

            <h3>Chat Namespace</h3>
            <input value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} />
            <button onClick={sendChatMessage}>Send Chat Message</button>

            <h3>Admin Namespace</h3>
            <input value={adminAlert} onChange={(e) => setAdminAlert(e.target.value)} />
            <button onClick={sendAdminAlert}>Send Admin Alert</button>
        </div>
    </>
  )
}

export default App


//only chatSocket can have access to chat-based events, and only adminSocket can have access to admin-based events 