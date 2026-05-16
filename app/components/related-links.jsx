import { Link as LinkIcon } from "lucide-react";

export function RelatedLinks({ items, onSelectDoc }) {
  return (
    <section className="related-panel" aria-labelledby="related-title">
      <div className="section-heading">
        <LinkIcon size={18} />
        <h2 id="related-title">Links relacionados</h2>
      </div>
      <div className="related-grid">
        {items.map(([title, description]) => (
          <button type="button" className="related-card" onClick={() => onSelectDoc(title)} key={title}>
            <span>{title}</span>
            <p>{description}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
