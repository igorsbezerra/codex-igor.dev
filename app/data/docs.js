export const docs = [
  {
    id: "overview",
    label: "Overview",
    group: "Documentacao",
    icon: "book",
    kicker: "Portal de documentacao",
    title: "Codex Docs Overview",
    intro:
      "Uma forma padronizada de organizar conhecimento, exemplos e fluxos de trabalho para produtos com IA.",
    sections: [
      {
        id: "what-is-codex-docs",
        title: "O que e o Codex Docs?",
        body:
          "Codex Docs e um portal para equipes que querem documentar APIs, agentes, prompts e integracoes com clareza. O layout separa navegacao, leitura e indice do assunto aberto para manter a consulta rapida.",
      },
      {
        id: "why-docs",
        title: "Por que usar este formato?",
        body:
          "A experiencia foi pensada para leitura tecnica: menu lateral persistente, conteudo central com hierarquia forte, blocos de codigo reutilizaveis e links relacionados sempre perto do contexto.",
      },
      {
        id: "how-it-works",
        title: "Como funciona?",
        body:
          "Cada item do menu carrega um conjunto de secoes, exemplos e referencias. A lateral direita acompanha o conteudo aberto e permite saltar direto para o trecho desejado.",
      },
    ],
    code: {
      title: "Estrutura sugerida",
      language: "txt",
      body: `docs-portal/
├── app/
│   ├── layout.jsx        # Metadados e shell global
│   ├── page.jsx          # Experiencia interativa
│   └── globals.css       # Tema claro/escuro
├── README.md             # Contexto do projeto
└── package.json          # Scripts do Next.js`,
    },
    related: [
      ["Guia de inicio", "Leia o fluxo rapido para criar sua primeira pagina."],
      ["Padroes de conteudo", "Veja como escrever exemplos curtos e acionaveis."],
      ["Design do portal", "Entenda a composicao em tres colunas."],
    ],
  },
  {
    id: "specification",
    label: "Specification",
    group: "Documentacao",
    icon: "fileCode",
    kicker: "Referencia",
    title: "Specification",
    intro:
      "Defina uma estrutura consistente para paginas, exemplos, cards e referencias dentro do portal.",
    sections: [
      {
        id: "page-model",
        title: "Modelo de pagina",
        body:
          "Uma pagina contem titulo, introducao, secoes ancoraveis, um exemplo principal de codigo e links relacionados. Esse contrato facilita busca, navegacao e futuras integracoes com IA.",
      },
      {
        id: "navigation-contract",
        title: "Contrato de navegacao",
        body:
          "O menu esquerdo troca o assunto ativo. O indice direito e derivado das secoes do assunto atual, evitando links quebrados e mantendo a leitura orientada.",
      },
      {
        id: "theme-contract",
        title: "Contrato de tema",
        body:
          "O tema usa tokens CSS para cores, bordas e sombras. A troca entre claro e escuro altera somente esses tokens, preservando layout e legibilidade.",
      },
    ],
    code: {
      title: "Objeto de conteudo",
      language: "js",
      body: `const page = {
  id: "quickstart",
  title: "Quickstart",
  intro: "Crie uma pagina documentada em minutos.",
  sections: [
    { id: "install", title: "Instalacao", body: "..." },
    { id: "publish", title: "Publicacao", body: "..." },
  ],
};`,
    },
    related: [
      ["Tokens de tema", "Variaveis CSS usadas para manter consistencia."],
      ["Ancoras internas", "Como criar links estaveis por secao."],
      ["Componentes de codigo", "Padrao para snippets com acoes."],
    ],
  },
  {
    id: "quickstart",
    label: "Quickstart",
    group: "Para criadores",
    icon: "rocket",
    kicker: "Primeiros passos",
    title: "Get started with Codex Docs",
    intro:
      "Crie uma experiencia de documentacao navegavel com Next.js, React e um sistema visual preparado para conteudo tecnico.",
    sections: [
      {
        id: "create-project",
        title: "Criar o projeto",
        body:
          "Comece com uma aplicacao Next.js e organize o conteudo em uma fonte de dados simples. Isso deixa o portal facil de expandir sem refatorar a interface.",
      },
      {
        id: "write-content",
        title: "Escrever o conteudo",
        body:
          "Cada assunto deve responder rapidamente o que e, quando usar, como implementar e onde continuar. Exemplos curtos ajudam mais que explicacoes longas.",
      },
      {
        id: "ship",
        title: "Publicar",
        body:
          "Depois de validar a interface localmente, publique na Vercel e conecte o fluxo ao PR para revisar codigo, deploy e conteudo juntos.",
      },
    ],
    code: {
      title: "Comandos principais",
      language: "bash",
      body: `npm install
npm run dev
npm run build`,
    },
    related: [
      ["Specification", "Consulte o formato completo das paginas."],
      ["Best practices", "Melhore legibilidade e manutencao."],
      ["Deploy", "Publique a experiencia na Vercel."],
    ],
  },
  {
    id: "best-practices",
    label: "Best practices",
    group: "Para criadores",
    icon: "lightbulb",
    kicker: "Qualidade",
    title: "Best practices",
    intro:
      "Boas docs reduzem ambiguidade, encurtam o caminho ate o primeiro sucesso e tornam exemplos faceis de reaproveitar.",
    sections: [
      {
        id: "scan-first",
        title: "Escreva para escaneamento",
        body:
          "Use titulos objetivos, paragrafos curtos e exemplos logo apos conceitos importantes. A pessoa deve encontrar a proxima acao sem procurar muito.",
      },
      {
        id: "examples",
        title: "Priorize exemplos executaveis",
        body:
          "Mostre comandos, estruturas e respostas esperadas. Bons exemplos funcionam como testes informais do que a documentacao promete.",
      },
      {
        id: "keep-context",
        title: "Mantenha contexto local",
        body:
          "Links relacionados devem continuar a jornada sem sequestrar a leitura. Use-os para aprofundamento, nao para explicar o essencial.",
      },
    ],
    code: {
      title: "Template de secao",
      language: "md",
      body: `## Titulo claro

Explique o resultado esperado em uma frase.

\`\`\`bash
comando --principal
\`\`\`

Continue com a menor observacao util.`,
    },
    related: [
      ["Checklist editorial", "Revise clareza, exemplos e proxima acao."],
      ["Padrao de snippet", "Mantenha blocos de codigo consistentes."],
      ["Links relacionados", "Conecte topicos sem poluir o texto."],
    ],
  },
  {
    id: "api",
    label: "API Reference",
    group: "Para implementadores",
    icon: "code",
    kicker: "Implementacao",
    title: "API Reference",
    intro:
      "Documente contratos de integracao com exemplos pequenos, respostas previsiveis e notas de comportamento.",
    sections: [
      {
        id: "request",
        title: "Request",
        body:
          "Descreva parametros obrigatorios, opcionais e limites. Quando houver decisoes importantes, mostre o padrao recomendado primeiro.",
      },
      {
        id: "response",
        title: "Response",
        body:
          "Inclua exemplos de sucesso e erro. Nomes de campos devem aparecer exatamente como a API retorna.",
      },
      {
        id: "errors",
        title: "Errors",
        body:
          "Agrupe erros por causa provavel e acao recomendada. Isso transforma a referencia em uma ferramenta de diagnostico.",
      },
    ],
    code: {
      title: "Exemplo de endpoint",
      language: "ts",
      body: `const response = await fetch("/api/docs/search", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ query: "tema escuro", limit: 5 }),
});

const results = await response.json();`,
    },
    related: [
      ["Autenticacao", "Padroes para tokens e permissoes."],
      ["Busca", "Como indexar secoes e snippets."],
      ["Erros comuns", "Mensagens claras para debugging."],
    ],
  },
  {
    id: "deploy",
    label: "Deploy",
    group: "Para implementadores",
    icon: "zap",
    kicker: "Publicacao",
    title: "Deploy",
    intro:
      "Publique a documentacao com preview por PR para revisar produto, texto e experiencia visual no mesmo fluxo.",
    sections: [
      {
        id: "preview",
        title: "Preview por branch",
        body:
          "Cada branch pode gerar um preview independente, ideal para revisar alteracoes de conteudo antes do merge.",
      },
      {
        id: "production",
        title: "Producao",
        body:
          "Depois da aprovacao, o merge para a branch principal publica a versao final com o mesmo build validado no PR.",
      },
      {
        id: "checks",
        title: "Validacoes",
        body:
          "Rode build local, confira responsividade e navegue pelos itens principais antes de solicitar revisao.",
      },
    ],
    code: {
      title: "Build de producao",
      language: "bash",
      body: `npm run build
vercel deploy --prebuilt
git push -u origin codex/docs-portal`,
    },
    related: [
      ["Vercel previews", "Compartilhe URLs de revisao por branch."],
      ["Pull requests", "Combine diff, preview e checklist."],
      ["Observabilidade", "Acompanhe erros depois do deploy."],
    ],
  },
];
