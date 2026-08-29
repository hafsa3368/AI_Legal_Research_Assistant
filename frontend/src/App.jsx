import { useEffect, useRef, useState } from "react";
import "./App.css";
import { askQuestion, getHealth } from "./api";
import AnswerCard from "./components/AnswerCard";

const LOADING_MESSAGES = [
  "Searching case law...",
  "Analyzing legal principles...",
  "Cross-checking citations...",
  "Synthesizing answer...",
];

function HealthStrip() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    const poll = () => getHealth().then(setHealth).catch(() => setHealth(null));
    poll();
    const id = setInterval(poll, 10000);
    return () => clearInterval(id);
  }, []);

  const services = [
    ["Neo4j", health?.neo4j],
    ["Qdrant", health?.qdrant],
    ["Ollama", health?.ollama],
  ];

  return (
    <div className="health-strip">
      {services.map(([name, up]) => (
        <span key={name} className={`health-dot ${up ? "up" : "down"}`}>
          <span className="dot" /> {name}
        </span>
      ))}
    </div>
  );
}

function LoadingBubble() {
  const [elapsed, setElapsed] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const tick = setInterval(() => setElapsed((s) => s + 1), 1000);
    const rotate = setInterval(
      () => setMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length),
      3500
    );
    return () => {
      clearInterval(tick);
      clearInterval(rotate);
    };
  }, []);

  return (
    <div className="message assistant loading">
      <div className="spinner" />
      <span>{LOADING_MESSAGES[msgIndex]} ({elapsed}s)</span>
    </div>
  );
}

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  async function handleSend() {
    const query = input.trim();
    if (!query || busy) return;
    setMessages((m) => [...m, { role: "user", text: query }]);
    setInput("");
    setBusy(true);
    try {
      const result = await askQuestion(query);
      setMessages((m) => [...m, { role: "assistant", result }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "assistant", error: err.message || "Something went wrong." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Pakistani Legal Research Assistant</h1>
        <HealthStrip />
      </header>

      <main className="chat-area">
        {messages.length === 0 && (
          <div className="empty-state">
            Ask a legal question, e.g. "Show me cases similar to PLD 2020 SC 1"
            or "How many bail cases are in the database?"
          </div>
        )}
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div className="message user" key={i}>
              {m.text}
            </div>
          ) : (
            <div className="message assistant" key={i}>
              {m.error ? (
                <span className="error-text">{m.error}</span>
              ) : (
                <AnswerCard sections={m.result.sections} mode={m.result.mode} />
              )}
            </div>
          )
        )}
        {busy && <LoadingBubble />}
        <div ref={bottomRef} />
      </main>

      <footer className="input-bar">
        <input
          type="text"
          value={input}
          placeholder="Ask a legal question..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={busy}
        />
        <button onClick={handleSend} disabled={busy || !input.trim()}>
          Send
        </button>
      </footer>
    </div>
  );
}