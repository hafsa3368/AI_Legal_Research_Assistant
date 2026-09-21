import { useState } from "react";
import { X, Trash2, ChevronDown, ChevronUp } from "lucide-react";

export default function SidePanel({
  title,
  items,
  emptyText,
  onClose,
  onItemClick,
  onItemDelete,
  expandable,
  renderExpanded,
  searchable,
  searchValue,
  onSearchChange,
}) {
  const [expandedId, setExpandedId] = useState(null);

  function handleClick(item) {
    if (expandable) {
      setExpandedId((id) => (id === item.id ? null : item.id));
    }
    if (onItemClick) onItemClick(item);
  }

  return (
    <div className="side-panel-overlay" onClick={onClose}>
      <div className="side-panel" onClick={(e) => e.stopPropagation()}>
        <div className="side-panel-header">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>

        {searchable && (
          <input
            className="side-panel-search"
            type="text"
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            autoFocus
          />
        )}

        <div className="side-panel-list">
          {items.length === 0 ? (
            <div className="side-panel-empty">{emptyText}</div>
          ) : (
            items.map((item) => (
              <div className="side-panel-item" key={item.id}>
                <div className="side-panel-item-row">
                  <button className="side-panel-item-body" onClick={() => handleClick(item)}>
                    <div className="side-panel-item-title">{item.title}</div>
                    {item.subtitle && <div className="side-panel-item-subtitle">{item.subtitle}</div>}
                  </button>
                  {expandable && (
                    expandedId === item.id
                      ? <ChevronUp size={15} className="side-panel-chevron" />
                      : <ChevronDown size={15} className="side-panel-chevron" />
                  )}
                  {onItemDelete && (
                    <button
                      className="icon-btn"
                      title="Delete"
                      onClick={() => onItemDelete(item.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
                {expandable && expandedId === item.id && renderExpanded && (
                  <div className="side-panel-expanded">{renderExpanded(item)}</div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
