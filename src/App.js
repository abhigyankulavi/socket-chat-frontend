import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import CryptoJS from "crypto-js";

const AES_SECRET = "ThisIsASecretKey123"; 
const socket = io("https://socket-chat-app-wupm.onrender.com");

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    socket.on("message", (data) => {
      const parsed = JSON.parse(data);
      const decrypted = CryptoJS.AES.decrypt(parsed.payload, AES_SECRET).toString(CryptoJS.enc.Utf8);

      if (parsed.type === "text") {
        setMessages((prev) => [...prev, `Text: ${decrypted}`]);
      } else if (parsed.type === "file") {
        const downloadLink = document.createElement("a");
        downloadLink.href = decrypted;
        downloadLink.download = parsed.filename || "file";
        downloadLink.textContent = `Download: ${parsed.filename}`;
        setMessages((prev) => [...prev, downloadLink.outerHTML]);
      }
    });

    return () => socket.off("message");
  }, []);

  const sendMessage = () => {
    if (!input.trim()) return;

    const encrypted = CryptoJS.AES.encrypt(input.trim(), AES_SECRET).toString();

    socket.send(JSON.stringify({
      type: "text",
      payload: encrypted,
    }));

    setInput("");
  };

  const sendFile = () => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      const encrypted = CryptoJS.AES.encrypt(base64, AES_SECRET).toString();

      socket.send(JSON.stringify({
        type: "file",
        payload: encrypted,
        filename: file.name,
        mimetype: file.type,
      }));
      setFile(null);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={styles.container}>
      <h2>📡 Socket Chat Room (Encrypted)</h2>

      <div style={styles.chatBox}>
        {messages.map((msg, idx) =>
          msg.startsWith("<a") ? (
            <div key={idx} dangerouslySetInnerHTML={{ __html: msg }} />
          ) : (
            <div key={idx} style={styles.message}>{msg}</div>
          )
        )}
      </div>

      <div style={styles.inputRow}>
        <input value={input} onChange={(e) => setInput(e.target.value)} style={styles.input} placeholder="Type a message..." />
        <button onClick={sendMessage} style={styles.button}>Send</button>
      </div>

      <div style={styles.inputRow}>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={sendFile} style={styles.button}>Send File</button>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: 20, fontFamily: "Arial", maxWidth: 500, margin: "auto" },
  chatBox: { border: "1px solid #ccc", padding: 10, height: 300, overflowY: "scroll", marginBottom: 10 },
  message: { padding: 5, borderBottom: "1px solid #eee" },
  inputRow: { display: "flex", gap: 10, marginBottom: 10 },
  input: { flex: 1, padding: 8, fontSize: 16 },
  button: { padding: 8, fontSize: 16 }
};

export default App;
