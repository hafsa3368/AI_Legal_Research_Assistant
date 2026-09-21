import { useState } from "react";
import { Bookmark } from "lucide-react";

const SECTION_LABELS = [
  ["legal_issue", "Legal Issue"],
  ["answer", "Answer"],
  ["principles", "Relevant Legal Principles"],
  ["case_law", "Relevant Case Law"],
  ["application", "Application to the Query"],
  ["limitations", "Limitations"],
  ["sources", "Sources Consulted"],
];

const MODE_LABELS = {
  listing_query: "Graph lookup",
  relationship_query: "Citation / similarity lookup",
  case_lookup_query: "Case lookup",
  llm_grounded: "Hybrid RAG",
  deterministic_fallback: "Deterministic fallback",
  out_of_scope_query: "Out of scope",
  conversational_query: "Greeting",
};

export default function AnswerCard({ sections, mode, rawAnswer, isSaved, onToggleSave }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(rawAnswer || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable; ignore */
    }
  }

  return (
    <div className="answer-card">
      <div className="answer-card-header">
        <span className="mode-badge">{MODE_LABELS[mode] || mode}</span>
        <div className="answer-card-actions">
          {onToggleSave && (
            <button
              className={`copy-btn ${isSaved ? "active" : ""}`}
              onClick={onToggleSave}
              title={isSaved ? "Remove from saved" : "Save this answer"}
            >
              <Bookmark size={13} fill={isSaved ? "currentColor" : "none"} />
              {isSaved ? "Saved" : "Save"}
            </button>
          )}
          <button className="copy-btn" onClick={handleCopy}>
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
      {SECTION_LABELS.map(([key, label]) =>
        sections[key] ? (
          <div className="answer-section" key={key}>
            <h4>{label}</h4>
            <p>{sections[key]}</p>
          </div>
        ) : null
      )}
    </div>
  );
}
