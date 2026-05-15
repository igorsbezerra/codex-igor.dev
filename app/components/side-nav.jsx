"use client";

import { X } from "lucide-react";
import { DocIcon } from "./doc-icons";

export function SideNav({ activeDocId, groupedDocs, isOpen, onClose, onSelectDoc }) {
  return (
    <aside className={`left-nav ${isOpen ? "is-open" : ""}`} aria-label="Menu principal">
      <div className="mobile-nav-header">
        <span>Menu</span>
        <button type="button" className="icon-button" onClick={onClose} aria-label="Fechar menu">
          <X size={20} />
        </button>
      </div>
      {Object.entries(groupedDocs).map(([group, items]) => (
        <div className="nav-group" key={group}>
          <p>{group}</p>
          {items.map((item) => (
            <button
              type="button"
              className={item.id === activeDocId ? "is-active" : ""}
              onClick={() => onSelectDoc(item.id)}
              key={item.id}
            >
              <DocIcon name={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      ))}
    </aside>
  );
}
