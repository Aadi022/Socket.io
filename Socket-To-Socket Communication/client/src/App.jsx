import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './App.css';  // Importing CSS for styling

const socket = io("http://localhost:3000");  // Connecting the client socket to the server socket

function App() {

  const [username, setUsername] = useState("");  // Holds current user's name
  const [registered, setRegistered] = useState(false);  // Tracks whether the user has completed registration
  const [users, setUsers] = useState({});  // Stores the username->socket.id mapping, received from the server
  const [selectedUser, setSelectedUser] = useState("");  // Keeps track of the user the current user is chatting with
  const [message, setMessage] = useState("");  // Stores the current message typed by the user
  const [chat, setChat] = useState([]);  // Maintains the history of chat messages in form of array of objects: {from, message}

  useEffect(() => {
    // Once the component gets mounted, two things happen:
    // 1) Client socket receives updated username->socket.id list from server
    // 2) Client socket starts listening for incoming messages from server
    socket.on("updated_user_list", function (userList) {
      setUsers(userList);
    });

    // Listening for private message delivery from server
    socket.on("receive_private_message", function ({ message, from }) {
      // Add received message to chat history
      setChat(prev => [...prev, { from, message }]);
    });

    // Cleanup socket event listeners on unmount
    return () => {
      socket.off("updated_user_list");
      socket.off("receive_private_message");
    };
  }, []);

  const handleRegister = () => {
    // This emits the new username to register in server's users list (username->socket.id)
    if (username) {
      socket.emit("register_user", username);
      setRegistered(true);
    }
  };

  const sendMessage = () => {
    // This is used to send a private message from client to server
    // It uses the event 'private_message' along with parameters: to, message, from
    if (selectedUser && message) {
      socket.emit("private_message", selectedUser, message, username);
      // Add sent message to chat history
      setChat(prev => [...prev, { from: username, message }]);
      setMessage("");  // Clear input after sending
    }
  };

  /*
    Flow of code:
    Suppose there are 2 client sockets-> A and B.
    A connects to the server and sends A's username. The server maps this to socket.id.
    Same happens for B.
    A selects B to message. The client emits to server using event 'private_message' with {to, message, from}.
    Server maps 'to' to the correct socket.id and emits to that socket.
    B receives the message with the 'from' field, so B knows it's from A.
  */

  return (
    <div className="chat-container">
      {!registered ? (
        <div className="register-box">
          <h2>Enter your name to join:</h2>
          <input value={username} onChange={(e) => setUsername(e.target.value)} />
          <button onClick={handleRegister}>Register</button>
        </div>
      ) : (
        <div className="chat-box">
          <div className="sidebar">
            <h3>{username}</h3>
            <h4>Online Users</h4>
            <ul>
              {Object.keys(users).map(user => (
                user !== username &&
                <li key={user}>
                  <button onClick={() => setSelectedUser(user)}>
                    {user}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="chat-section">
            <h4>Chat with: {selectedUser || 'No one selected'}</h4>
            <div className="messages">
              {chat
                .filter(msg => msg.from === selectedUser || msg.from === username)
                .map((msg, i) => (
                  <div key={i} className={`message ${msg.from === username ? "sent" : "received"}`}>
                    <p><strong>{msg.from}</strong>: {msg.message}</p>
                  </div>
              ))}
            </div>

            <div className="message-input">
              <input
                placeholder="Type your message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

/*
  Summary of Events:
  1) private_message: Used when client wants to send a private message. Client emits this; server listens.
  2) receive_private_message: Used by server to deliver the message. Server emits this; target client listens.
*/
