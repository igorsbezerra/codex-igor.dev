"use client";

import { Github, Layers3, Menu, Moon, PanelLeft, Search, Sparkles, Sun } from "lucide-react";

export function TopBar({ query, theme, onOpenMenu, onOpenSearch, onToggleSidebar, sidebarCollapsed, onToggleTheme }) {
  return (
    <header className="topbar">
      <div className="brand">
        <button type="button" className="icon-button mobile-menu-button" onClick={onOpenMenu} aria-label="Abrir menu">
          <Menu size={21} />
        </button>
        <button
          type="button"
          className="icon-button sidebar-toggle-button"
          onClick={onToggleSidebar}
          aria-label={sidebarCollapsed ? "Mostrar sidebar" : "Esconder sidebar"}
          title="Toggle sidebar (⌘B)"
        >
          <PanelLeft size={20} />
        </button>
        <Layers3 size={30} />
        <span>Java 21 Docs</span>
      </div>

      <button type="button" className="search-box" onClick={onOpenSearch}>
        <Search size={20} />
        <span>{query || "Search..."}</span>
        <kbd>⌘K</kbd>
      </button>

      <div className="topbar-actions">
        <button type="button" className="ask-button">
          <Sparkles size={18} />
          Ask AI
        </button>
        <a
          href="https://github.com/igorsbezerra/codex-igor.dev"
          className="repo-link"
          aria-label="Abrir repositorio no GitHub"
        >
          <Github size={20} />
          <span>igorsbezerra/codex</span>
        </a>
        <button type="button" className="icon-button" onClick={onToggleTheme} aria-label="Alternar tema">
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
}
