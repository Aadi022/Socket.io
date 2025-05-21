import React, {useState, useEffect} from 'react';
import {io} from 'socket.io-client';

const socket= io('http://localhost:3000');  //connecting to server, and creating a client socket instance

function App() {

  const [message, setMessage]= useState("");  //State variable to send message to server
  const [response, setResponse]= useState(""); //State variable to store the messages received from the server

  useEffect(function(){
    //now using our socket instance, once are component gets mounted, client socket will receive message from server socket
    socket.on('receive message',function(data){
      console.log("Received message from the server socket: ",data);
      setResponse(data);
    });

    return function(){
      socket.off("receive message");  //IT IS A VERY GOOD PRACTICE TO DO SOCKET.OFF FOR EVERY SOCKET.ON TO PREVENT MEMORY LEAKS WHILE UNMOUNTING
    }
  },[])

  const sendMessage= function sendMessage(){
    socket.emit("send_message",message);
  };

  const handleInput= function handleInput(e){
    setMessage(e.target.value);
  }

  return (
    <>
      <div>
        <h2>Websocket Connection Communication</h2>
        <input type='text' value={message} onChange={handleInput} placeholder="Enter message to send to server socket"/>
        <button onClick={sendMessage}>Send to Server</button>
      </div>
    </>
  )
}

export default App
