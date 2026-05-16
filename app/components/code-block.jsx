"use client";

import { CheckCircle2, Copy, Sparkles } from "lucide-react";
import { useState } from "react";

const JAVA_KEYWORDS = [
  "abstract",
  "case",
  "catch",
  "class",
  "default",
  "double",
  "else",
  "extends",
  "final",
  "for",
  "if",
  "implements",
  "import",
  "int",
  "interface",
  "new",
  "package",
  "permits",
  "private",
  "public",
  "record",
  "return",
  "sealed",
  "static",
  "switch",
  "throws",
  "try",
  "var",
  "void",
  "when",
  "yield",
];

const BASH_KEYWORDS = ["java", "javac"];

function tokenizeCode(source, language) {
  const keywords = language === "bash" ? BASH_KEYWORDS : JAVA_KEYWORDS;
  const keywordPattern = keywords.join("|");
  const tokenPattern = new RegExp(
    [
      "(//.*|#.*)",
      "(\"(?:\\\\.|[^\"\\\\])*\"|'(?:\\\\.|[^'\\\\])*')",
      "(@[A-Za-z_]\\w*)",
      "(--?[A-Za-z][A-Za-z0-9:-]*)",
      "(\\b\\d+(?:\\.\\d+)?\\b)",
      `(\\b(?:${keywordPattern})\\b)`,
      "(\\b[A-Z][A-Za-z0-9_]*\\b)",
      "(\\b[A-Za-z_]\\w*(?=\\s*\\())",
    ].join("|"),
    "g",
  );

  const tokens = [];
  let cursor = 0;
  let match;

  while ((match = tokenPattern.exec(source)) !== null) {
    if (match.index > cursor) {
      tokens.push({ value: source.slice(cursor, match.index) });
    }

    const [, comment, string, annotation, flag, number, keyword, type, functionName] = match;
    const kind =
      (comment && "comment") ||
      (string && "string") ||
      (annotation && "annotation") ||
      (flag && "flag") ||
      (number && "number") ||
      (keyword && "keyword") ||
      (type && "type") ||
      (functionName && "function");

    tokens.push({ kind, value: match[0] });
    cursor = tokenPattern.lastIndex;
  }

  if (cursor < source.length) {
    tokens.push({ value: source.slice(cursor) });
  }

  return tokens;
}

export function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false);
  const tokens = tokenizeCode(code.body, code.language);

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
        <code>
          {tokens.map((token, index) =>
            token.kind ? (
              <span className={`code-token code-token-${token.kind}`} key={`${token.kind}-${index}`}>
                {token.value}
              </span>
            ) : (
              token.value
            ),
          )}
        </code>
      </pre>
    </div>
  );
}
