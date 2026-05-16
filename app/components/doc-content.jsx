"use client";

import { ChevronDown, Clipboard } from "lucide-react";
import { AIAssistantPanel } from "./ai-assistant-panel";
import { CodeBlock } from "./code-block";
import { FeatureCards } from "./feature-cards";
import { RelatedLinks } from "./related-links";

export function DocContent({ doc, onCopyPage, onSelectRelatedDoc }) {
  return (
    <article className="content-card">
      <div className="doc-actions">
        <span>{doc.kicker}</span>
        <button type="button" onClick={onCopyPage}>
          <Clipboard size={18} />
          Copy page
          <ChevronDown size={16} />
        </button>
      </div>

      <section className="hero-section">
        <h1>{doc.title}</h1>
        <p>{doc.intro}</p>
      </section>

      {doc.id === "quickstart" && <FeatureCards />}

      <div className="article-flow">
        {doc.sections.map((section) => (
          <section id={section.id} key={section.id}>
            <h2>{section.title}</h2>
            <p>{section.body}</p>
          </section>
        ))}
      </div>

      <CodeBlock code={doc.code} />
      <RelatedLinks items={doc.related} onSelectDoc={onSelectRelatedDoc} />
      <AIAssistantPanel />
    </article>
  );
}
