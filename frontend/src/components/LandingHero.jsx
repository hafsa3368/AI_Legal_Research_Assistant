import { Scale } from "lucide-react";
import { SUGGESTIONS } from "../constants";
import InputCard from "./InputCard";

export default function LandingHero({ input, setInput, onSend, onKeyDown, busy, onOpenTools }) {
  return (
    <div className="landing-hero">
      <div className="landing-logo">
        <span className="landing-logo-mark">
          <Scale size={22} />
        </span>
        <span className="landing-logo-name">Adalat AI</span>
      </div>
      <h1 className="landing-heading">How can I help with your legal research?</h1>

      <InputCard
        value={input}
        onChange={setInput}
        onSend={onSend}
        onKeyDown={onKeyDown}
        busy={busy}
        placeholder="Ask about a case, citation, or legal principle..."
        variant="hero"
        onOpenTools={onOpenTools}
      />

      <div className="suggestion-pills">
        {SUGGESTIONS.map(({ icon: Icon, label, prefill }) => (
          <button
            key={label}
            className="suggestion-pill"
            onClick={() => setInput(prefill)}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      <p className="landing-footnote">
        Grounded in Pakistani Supreme &amp; High Court case law via hybrid graph-RAG retrieval.
      </p>
    </div>
  );
}
