import {
  Menu,
  SquarePen,
  Home,
  Scale,
  Clock,
  Bookmark,
  Search,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { SUGGESTIONS } from "../constants";

const THEME_ICONS = { system: Monitor, light: Sun, dark: Moon };

export default function Sidebar({
  onNewChat,
  onHome,
  onCaseLawShortcut,
  onOpenHistory,
  onOpenSaved,
  onOpenSearch,
  collapsed,
  onToggleCollapsed,
  theme,
  setTheme,
}) {
  const nextTheme = { system: "light", light: "dark", dark: "system" };
  const ThemeIcon = THEME_ICONS[theme];
  const caseLawSuggestion = SUGGESTIONS.find((s) => s.label === "Bail Cases") || SUGGESTIONS[1];

  if (collapsed) {
    return (
      <aside className="sidebar collapsed">
        <div className="sidebar-brand-mark" title="Adalat AI">
          <Scale size={18} />
        </div>
        <button className="sidebar-icon" title="Expand menu" onClick={onToggleCollapsed}>
          <Menu size={20} />
        </button>
      </aside>
    );
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark">
          <Scale size={18} />
        </div>
        <span className="sidebar-brand-name">Adalat AI</span>
      </div>

      <button className="sidebar-icon" title="Collapse menu" onClick={onToggleCollapsed}>
        <Menu size={20} />
      </button>
      <button className="sidebar-icon" title="New chat" onClick={onNewChat}>
        <SquarePen size={20} />
      </button>

      <div className="sidebar-divider" />

      <button className="sidebar-icon" title="Home" onClick={onHome}>
        <Home size={20} />
      </button>
      <button className="sidebar-icon" title="Case law" onClick={() => onCaseLawShortcut(caseLawSuggestion.prefill)}>
        <Scale size={20} />
      </button>
      <button className="sidebar-icon" title="History" onClick={onOpenHistory}>
        <Clock size={20} />
      </button>
      <button className="sidebar-icon" title="Saved" onClick={onOpenSaved}>
        <Bookmark size={20} />
      </button>
      <button className="sidebar-icon" title="Search" onClick={onOpenSearch}>
        <Search size={20} />
      </button>

      <div className="sidebar-spacer" />

      <button
        className="sidebar-icon"
        title={`Theme: ${theme}`}
        onClick={() => setTheme(nextTheme[theme])}
      >
        <ThemeIcon size={20} />
      </button>
    </aside>
  );
}
