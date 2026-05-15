import { FileCode2, Rocket } from "lucide-react";

export function FeatureCards() {
  return (
    <section className="feature-grid" aria-label="Guias em destaque">
      <article className="feature-card is-strong">
        <Rocket size={32} />
        <h3>Quickstart</h3>
        <p>Crie sua primeira pagina de documentacao e veja o portal em acao.</p>
      </article>
      <article className="feature-card">
        <FileCode2 size={32} />
        <h3>Specification</h3>
        <p>Consulte o formato completo para conteudo, temas e navegacao.</p>
      </article>
    </section>
  );
}
