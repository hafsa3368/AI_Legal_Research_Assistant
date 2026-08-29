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
};

export default function AnswerCard({ sections, mode }) {
  return (
    <div className="answer-card">
      <span className="mode-badge">{MODE_LABELS[mode] || mode}</span>
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