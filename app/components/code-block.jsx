"use client";

import { CheckCircle2, Copy, Sparkles } from "lucide-react";
import { useState } from "react";

export function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    await navigator.clipboard.writeText(code.body);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className="code-card">
      <div className="code-toolbar">
        <div>
          <span className="code-title">{code.title}</span>
          <span className="code-language">{code.language}</span>
        </div>
        <div className="code-actions" aria-label="Ações do código">
          <button type="button" aria-label="Validar exemplo">
            <CheckCircle2 size={18} />
          </button>
          <button type="button" onClick={copyCode} aria-label="Copiar código">
            {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
          </button>
          <button type="button" aria-label="Melhorar com IA">
            <Sparkles size={18} />
          </button>
        </div>
      </div>
      <pre>
        <code>{code.body}</code>
      </pre>
    </div>
  );
}
