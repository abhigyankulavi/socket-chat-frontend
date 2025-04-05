import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("https://socket-chat-app-wupm.onrender.com");

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const handleMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };
  
    socket.on("message", handleMessage);
    return () => {
      socket.off("message", handleMessage);
    };
  }, []);

  const sendMessage = () => {
    if (input.trim()) {
      socket.send(input);
      setInput("");
    }
  };

  return (
    <div style={styles.container}>
      <h2> Socket Chat Room</h2>
      <div style={styles.chatBox}>
        {messages.map((msg, idx) => (
          <div key={idx} style={styles.message}>{msg}</div>
        ))}
      </div>
      <div style={styles.inputRow}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={styles.input}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} style={styles.button}>Send</button>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: 20, fontFamily: "Arial", maxWidth: 500, margin: "auto" },
  chatBox: { border: "1px solid #ccc", padding: 10, height: 300, overflowY: "scroll", marginBottom: 10 },
  message: { padding: 5, borderBottom: "1px solid #eee" },
  inputRow: { display: "flex", gap: 10 },
  input: { flex: 1, padding: 8, fontSize: 16 },
  button: { padding: 8, fontSize: 16 }
};

export default App;
