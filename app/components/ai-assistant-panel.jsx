import { Bot, Sparkles } from "lucide-react";

export function AIAssistantPanel() {
  return (
    <section className="ai-callout">
      <div>
        <Bot size={22} />
        <h2>Assistente integrado</h2>
      </div>
      <p>
        Use o conteudo aberto como contexto para perguntar, resumir ou gerar proximos exemplos sem perder o ponto da
        documentacao.
      </p>
      <label>
        <input placeholder="Ask a question..." aria-label="Perguntar ao assistente" />
        <button type="button" aria-label="Enviar pergunta">
          <Sparkles size={18} />
        </button>
      </label>
    </section>
  );
}
