"use client";

import { Search } from "lucide-react";
import { DocIcon } from "./doc-icons";

export function SearchDialog({ isOpen, query, results, onClose, onQueryChange, onSelectDoc }) {
  if (!isOpen) return null;

  return (
    <div
      className="search-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="search-modal" aria-label="Busca global">
        <label className="search-modal-field">
          <Search size={24} />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search..."
            aria-label="Buscar na documentação"
          />
          <kbd>esc</kbd>
        </label>
        <div className="search-results" aria-label="Resultados da busca">
          {results.map((item) => (
            <button type="button" onClick={() => onSelectDoc(item.id)} key={item.id}>
              <DocIcon name={item.icon} />
              <span>
                <strong>{item.label}</strong>
                <small>{item.title}</small>
              </span>
            </button>
          ))}
          {results.length === 0 && <p>Nenhum resultado encontrado.</p>}
        </div>
      </section>
    </div>
  );
}
