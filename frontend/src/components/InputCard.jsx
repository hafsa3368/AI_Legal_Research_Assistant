import { useState } from "react";
import { Plus, Mic, ArrowUp, ChevronDown } from "lucide-react";
import { SUGGESTIONS } from "../constants";

export default function InputCard({
  value,
  onChange,
  onSend,
  onKeyDown,
  busy,
  placeholder,
  variant = "footer",
  onOpenTools,
}) {
  const [showTemplates, setShowTemplates] = useState(false);

  function handleTemplateClick(prefill) {
    onChange(prefill);
    setShowTemplates(false);
  }

  return (
    <div className={`input-card input-card-${variant}`}>
      <textarea
        value={value}
        placeholder={placeholder || "Ask a legal question..."}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={busy}
        rows={variant === "hero" ? 2 : 1}
      />
      <div className="input-card-controls">
        <div className="input-card-controls-left">
          <div className="dropdown-wrap">
            <button
              className="pill-icon-btn"
              title="Insert a query template"
              onClick={() => setShowTemplates((v) => !v)}
            >
              <Plus size={16} />
            </button>
            {showTemplates && (
              <div className="dropdown-menu">
                {SUGGESTIONS.map(({ icon: Icon, label, prefill }) => (
                  <button
                    key={label}
                    className="dropdown-item"
                    onClick={() => handleTemplateClick(prefill)}
                  >
                    <Icon size={15} />
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="pill-btn" title="Search your past chats" onClick={onOpenTools}>
            Tools <ChevronDown size={14} />
          </button>
        </div>
        <div className="input-card-controls-right">
          <button className="pill-btn" title="Mode" disabled>
            Legal RAG <ChevronDown size={14} />
          </button>
          <button className="pill-icon-btn" title="Voice input (coming soon)" disabled>
            <Mic size={16} />
          </button>
          <button
            className="send-btn"
            onClick={onSend}
            disabled={busy || !value.trim()}
            title="Send"
          >
            <ArrowUp size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
