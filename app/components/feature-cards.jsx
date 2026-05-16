import { FileCode2, Rocket } from "lucide-react";

export function FeatureCards() {
  return (
    <section className="feature-grid" aria-label="Guias em destaque">
      <article className="feature-card is-strong">
        <Rocket size={32} />
        <h3>Quickstart</h3>
        <p>Crie sua primeira página de documentação e veja o portal em ação.</p>
      </article>
      <article className="feature-card">
        <FileCode2 size={32} />
        <h3>Specification</h3>
        <p>Consulte o formato completo para conteúdo, temas e navegação.</p>
      </article>
    </section>
  );
}
