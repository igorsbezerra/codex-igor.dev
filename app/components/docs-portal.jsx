"use client";

import { useEffect, useMemo, useState } from "react";
import { docs } from "../data/docs";
import { filterNavigationDocs, getPageCopy, searchDocs } from "../lib/docs";
import { DocContent } from "./doc-content";
import { RightToc } from "./right-toc";
import { SearchDialog } from "./search-dialog";
import { SideNav } from "./side-nav";
import { TopBar } from "./top-bar";

export function DocsPortal() {
  const [activeId, setActiveId] = useState("overview");
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState("light");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const activeDoc = docs.find((item) => item.id === activeId) ?? docs[0];

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("docs-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(storedTheme || (prefersDark ? "dark" : "light"));
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("docs-theme", theme);
  }, [theme]);

  useEffect(() => {
    function onKeyDown(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }

      if (event.key === "Escape") {
        setSearchOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!searchOpen) return;
    document.body.classList.add("is-searching");
    window.requestAnimationFrame(() => {
      document.querySelector(".search-modal input")?.focus();
    });

    return () => document.body.classList.remove("is-searching");
  }, [searchOpen]);

  const filteredGroups = useMemo(() => filterNavigationDocs(docs, query), [query]);
  const searchResults = useMemo(() => searchDocs(docs, query), [query]);

  async function copyPage() {
    await navigator.clipboard.writeText(getPageCopy(activeDoc));
  }

  function selectDoc(id) {
    setActiveId(id);
    setMobileMenuOpen(false);
    setSearchOpen(false);
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  return (
    <main className="docs-shell">
      <SearchDialog
        isOpen={searchOpen}
        query={query}
        results={searchResults}
        onClose={() => setSearchOpen(false)}
        onQueryChange={setQuery}
        onSelectDoc={selectDoc}
      />

      <TopBar
        query={query}
        theme={theme}
        onOpenMenu={() => setMobileMenuOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
        onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
      />

      <div className="layout-grid">
        <SideNav
          activeDocId={activeDoc.id}
          groupedDocs={filteredGroups}
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          onSelectDoc={selectDoc}
        />
        <DocContent doc={activeDoc} onCopyPage={copyPage} />
        <RightToc sections={activeDoc.sections} />
      </div>
    </main>
  );
}
