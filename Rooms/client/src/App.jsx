import React,{useState,useEffect} from 'react';
import {io} from 'socket.io-client';

const chatSocket= io("http:/localhost:3000/chat");  //connecting the client socket to the /chat namespace of the server socket

function App(){
  
  const [room,setRoom]= useState("");  //state variable to store the room name
  const [joined,setJoined]= useState(false);  //state variable to store whether the user has joined the room or not
  const [message,setMessage]= useState("");  //state variable to store the message the user wants to send
  const [chatLog,setChatLog]= useState([]);  //state variable to store the entire chat history

  useEffect(function(){
    chatSocket.on("receive-room_message", function(sender,message){  //event to listen for messages sent by other user in the room
      setChatLog(prev=>[...prev, {sender: sender, message: message}]);
    });

    chatSocket.on("user_joined", function(msg){  //event to listen to any user joined
      setChatLog(prev=>[...prev,{sender:"System", message: msg}]);
    });

    chatSocket.on("user_left", function(msg){  //event to listen to any user left
      setChatLog(prev=>[...prev,{sender:"System",message:msg}]);
    });
  });

  const joinRoom= function joinRoom(){  //As soon as the user selects the room to join, the client socket emits to the server socket for the event 'join_room'
    if(room){
      chatSocket.emit("join_room",room);
      setJoined(true);
    }
  };

  const leaveRoom= function leaveRoom(){  //As soon as the user leaves the room, the event of "leave_room" is emitted to the server
    chatSocket.emit('leave_room',room);
    setJoined(false);
  };

  const sendMessage= function sendMessage(){
    chatSocket.emit("send_room_message",{room,message});
    setChatLog(prev=>[...prev,{sender:"You", message:message}]);
    setMessage("");
  }

  return(
    <>
        <div style={{ padding: 20 }}>
            <h2>Room-based Chat (Namespace: /chat)</h2>

            {!joined ? (
                <>
                    <input
                        value={room}
                        onChange={(e) => setRoom(e.target.value)}
                        placeholder="Enter room name"
                    />
                    <button onClick={joinRoom}>Join Room</button>
                </>
            ) : (
                <>
                    <p>Room: {room}</p>
                    <input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message"
                    />
                    <button onClick={sendMessage}>Send</button>
                    <button onClick={leaveRoom}>Leave Room</button>
                </>
            )}

            <div style={{ marginTop: 20 }}>
                {chatLog.map((msg, i) => (
                    <p key={i}>
                        <strong>{msg.sender}:</strong> {msg.message}
                    </p>
                ))}
            </div>
        </div>
    </>
  )
}

export default App;

//to do any socket operation of emit/listen only use the instance used to create the socket->chatSocket