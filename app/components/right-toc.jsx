import { Menu } from "lucide-react";

export function RightToc({ sections }) {
  return (
    <aside className="right-toc" aria-label="Nesta página">
      <div>
        <div className="toc-title">
          <Menu size={18} />
          <span>On this page</span>
        </div>
        <nav>
          {sections.map((section) => (
            <a href={`#${section.id}`} key={section.id}>
              {section.title}
            </a>
          ))}
          <a href="#related-title">Links relacionados</a>
        </nav>
      </div>
    </aside>
  );
}
