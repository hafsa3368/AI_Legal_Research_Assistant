import { useEffect, useRef, useState } from "react";
import "./App.css";
import { askQuestion, getHealth } from "./api";
import AnswerCard from "./components/AnswerCard";
import Sidebar from "./components/Sidebar";
import LandingHero from "./components/LandingHero";
import InputCard from "./components/InputCard";
import SidePanel from "./components/SidePanel";

const LOADING_MESSAGES = [
  "Searching case law...",
  "Analyzing legal principles...",
  "Cross-checking citations...",
  "Synthesizing answer...",
];

const STORAGE_KEY = "legal-assistant-messages";
const THEME_KEY = "legal-assistant-theme";
const HISTORY_KEY = "legal-assistant-history";
const SAVED_KEY = "legal-assistant-saved";
const MAX_HISTORY = 100;

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota/storage errors */
  }
}

function newId() {
  return (crypto.randomUUID && crypto.randomUUID()) || `${Date.now()}-${Math.random()}`;
}

function conversationTitle(messages) {
  const firstUser = messages.find((m) => m.role === "user");
  const text = firstUser?.text || "Untitled chat";
  return text.length > 60 ? text.slice(0, 60) + "..." : text;
}

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
  const [messages, setMessages] = useState(() => loadJSON(STORAGE_KEY, []));
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [theme, setTheme] = useState(() => loadJSON(THEME_KEY, "system") || "system");
  const [conversations, setConversations] = useState(() => loadJSON(HISTORY_KEY, []));
  const [savedAnswers, setSavedAnswers] = useState(() => loadJSON(SAVED_KEY, []));
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [openPanel, setOpenPanel] = useState(null); // 'history' | 'saved' | 'search' | null
  const [searchTerm, setSearchTerm] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  useEffect(() => saveJSON(STORAGE_KEY, messages), [messages]);
  useEffect(() => saveJSON(HISTORY_KEY, conversations), [conversations]);
  useEffect(() => saveJSON(SAVED_KEY, savedAnswers), [savedAnswers]);

  useEffect(() => {
    if (theme === "system") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", theme);
    }
    saveJSON(THEME_KEY, theme);
  }, [theme]);

  async function handleSend() {
    const query = input.trim();
    if (!query || busy) return;
    setMessages((m) => [...m, { id: newId(), role: "user", text: query }]);
    setInput("");
    setBusy(true);
    try {
      const result = await askQuestion(query);
      setMessages((m) => [...m, { id: newId(), role: "assistant", result }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { id: newId(), role: "assistant", error: err.message || "Something went wrong." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function archiveCurrentIfNeeded() {
    if (messages.length === 0) return;
    const entry = { id: newId(), title: conversationTitle(messages), messages, savedAt: Date.now() };
    setConversations((c) => [entry, ...c].slice(0, MAX_HISTORY));
  }

  function handleNewChat() {
    archiveCurrentIfNeeded();
    setMessages([]);
  }

  function handleOpenConversation(item) {
    archiveCurrentIfNeeded();
    setMessages(item.messages);
    setConversations((c) => c.filter((x) => x.id !== item.id));
    setOpenPanel(null);
  }

  function handleDeleteConversation(id) {
    setConversations((c) => c.filter((x) => x.id !== id));
  }

  function handleToggleSave(message) {
    const existing = savedAnswers.find((s) => s.sourceMessageId === message.id);
    if (existing) {
      setSavedAnswers((s) => s.filter((x) => x.sourceMessageId !== message.id));
      return;
    }
    const precedingUser = messages
      .slice(0, messages.findIndex((m) => m.id === message.id))
      .reverse()
      .find((m) => m.role === "user");
    const entry = {
      id: newId(),
      sourceMessageId: message.id,
      query: precedingUser?.text || "",
      sections: message.result.sections,
      mode: message.result.mode,
      rawAnswer: message.result.raw_answer,
      savedAt: Date.now(),
    };
    setSavedAnswers((s) => [entry, ...s]);
  }

  function handleDeleteSaved(id) {
    setSavedAnswers((s) => s.filter((x) => x.id !== id));
  }

  function handleCaseLawShortcut(prefill) {
    setInput(prefill);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const isLanding = messages.length === 0;
  const savedIds = new Set(savedAnswers.map((s) => s.sourceMessageId));

  const historyItems = conversations.map((c) => ({
    id: c.id,
    title: c.title,
    subtitle: new Date(c.savedAt).toLocaleString(),
  }));

  const savedItems = savedAnswers.map((s) => ({
    id: s.id,
    title: s.query || "Saved answer",
    subtitle: new Date(s.savedAt).toLocaleString(),
    _raw: s,
  }));

  const searchLower = searchTerm.trim().toLowerCase();
  const searchResults = searchLower
    ? [
        ...conversations
          .filter((c) => c.title.toLowerCase().includes(searchLower))
          .map((c) => ({ id: c.id, title: c.title, subtitle: "Past chat", kind: "history" })),
        ...savedAnswers
          .filter(
            (s) =>
              (s.query || "").toLowerCase().includes(searchLower) ||
              (s.rawAnswer || "").toLowerCase().includes(searchLower)
          )
          .map((s) => ({ id: s.id, title: s.query || "Saved answer", subtitle: "Saved answer", kind: "saved", _raw: s })),
      ]
    : [];

  function handleSearchResultClick(item) {
    if (item.kind === "history") {
      const conv = conversations.find((c) => c.id === item.id);
      if (conv) handleOpenConversation(conv);
    }
  }

  return (
    <div className="shell">
      <Sidebar
        onNewChat={handleNewChat}
        onHome={handleNewChat}
        onCaseLawShortcut={handleCaseLawShortcut}
        onOpenHistory={() => setOpenPanel("history")}
        onOpenSaved={() => setOpenPanel("saved")}
        onOpenSearch={() => setOpenPanel("search")}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((c) => !c)}
        theme={theme}
        setTheme={setTheme}
      />

      <main className={`main-area ${isLanding ? "is-landing" : ""}`}>
        <div className="top-bar">
          <HealthStrip />
        </div>

        {isLanding ? (
          <LandingHero
            input={input}
            setInput={setInput}
            onSend={handleSend}
            onKeyDown={handleKeyDown}
            busy={busy}
            onOpenTools={() => setOpenPanel("search")}
          />
        ) : (
          <>
            <div className="chat-area">
              {messages.map((m) =>
                m.role === "user" ? (
                  <div className="message user" key={m.id}>
                    {m.text}
                  </div>
                ) : (
                  <div className="message assistant" key={m.id}>
                    {m.error ? (
                      <span className="error-text">{m.error}</span>
                    ) : (
                      <AnswerCard
                        sections={m.result.sections}
                        mode={m.result.mode}
                        rawAnswer={m.result.raw_answer}
                        isSaved={savedIds.has(m.id)}
                        onToggleSave={() => handleToggleSave(m)}
                      />
                    )}
                  </div>
                )
              )}
              {busy && <LoadingBubble />}
              <div ref={bottomRef} />
            </div>

            <footer className="input-bar">
              <InputCard
                value={input}
                onChange={setInput}
                onSend={handleSend}
                onKeyDown={handleKeyDown}
                busy={busy}
                variant="footer"
                onOpenTools={() => setOpenPanel("search")}
              />
            </footer>
          </>
        )}
      </main>

      {openPanel === "history" && (
        <SidePanel
          title="History"
          items={historyItems}
          emptyText="No past conversations yet."
          onClose={() => setOpenPanel(null)}
          onItemClick={(item) => {
            const conv = conversations.find((c) => c.id === item.id);
            if (conv) handleOpenConversation(conv);
          }}
          onItemDelete={handleDeleteConversation}
        />
      )}

      {openPanel === "saved" && (
        <SidePanel
          title="Saved answers"
          items={savedItems}
          emptyText="No saved answers yet — click Save on any answer to keep it here."
          onClose={() => setOpenPanel(null)}
          onItemDelete={handleDeleteSaved}
          expandable
          renderExpanded={(item) => (
            <AnswerCard
              sections={item._raw.sections}
              mode={item._raw.mode}
              rawAnswer={item._raw.rawAnswer}
            />
          )}
        />
      )}

      {openPanel === "search" && (
        <SidePanel
          title="Search"
          items={searchResults}
          emptyText={searchTerm ? "No matches found." : "Type to search your past chats and saved answers."}
          onClose={() => {
            setOpenPanel(null);
            setSearchTerm("");
          }}
          onItemClick={handleSearchResultClick}
          searchable
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          expandable
          renderExpanded={(item) =>
            item.kind === "saved" ? (
              <AnswerCard
                sections={item._raw.sections}
                mode={item._raw.mode}
                rawAnswer={item._raw.rawAnswer}
              />
            ) : null
          }
        />
      )}
    </div>
  );
}
