export const docs = [
  {
    id: "overview",
    label: "Overview",
    group: "Java 21",
    icon: "book",
    kicker: "Java 21 LTS",
    title: "Java 21 Deep Dive",
    intro:
      "Um guia pratico sobre as principais novidades do Java 21, com foco em quando usar cada recurso e como aplica-lo em codigo real.",
    sections: [
      {
        id: "why-java-21",
        title: "Por que Java 21 importa?",
        body:
          "Java 21 e uma versao LTS que consolida recursos de linguagem, concorrencia e runtime vindos de varios ciclos anteriores. Ela e especialmente importante para sistemas de backend porque combina virtual threads, pattern matching, record patterns e melhorias de colecoes em uma base estavel para modernizar codigo sem abandonar o ecossistema JVM.",
      },
      {
        id: "migration-strategy",
        title: "Estrategia de migracao",
        body:
          "A migracao ideal comeca pelo runtime e build pipeline, depois habilita recursos finais da linguagem e por ultimo avalia previews com flags explicitas. Em aplicacoes Spring, Quarkus ou Micronaut, o maior ganho inicial costuma vir de virtual threads para workloads bloqueantes e de pattern matching para reduzir codigo defensivo.",
      },
      {
        id: "preview-vs-final",
        title: "Recursos finais e preview",
        body:
          "Virtual threads, pattern matching for switch, record patterns e sequenced collections estao finais. String templates, unnamed patterns, unnamed classes, scoped values, structured concurrency e FFM ainda sao preview/incubator em Java 21 e exigem --enable-preview quando usados em producao experimental ou estudos.",
      },
    ],
    code: {
      title: "Checagem de ambiente Java 21",
      language: "bash",
      body: `java --version
javac --version

# Para recursos preview:
javac --release 21 --enable-preview Main.java
java --enable-preview Main`,
    },
    related: [
      ["Virtual Threads", "Comece por aqui se sua aplicacao faz muito I/O bloqueante."],
      ["Pattern Matching", "Modernize condicionais e reduza casts manuais."],
      ["Sequenced Collections", "Padronize acesso ao primeiro e ultimo elemento."],
    ],
  },
  {
    id: "virtual-threads",
    label: "Virtual Threads",
    group: "Concorrencia",
    icon: "rocket",
    kicker: "JEP 444",
    title: "Virtual Threads",
    intro:
      "Threads leves gerenciadas pela JVM para aumentar throughput em workloads bloqueantes sem escrever codigo reativo complexo.",
    sections: [
      {
        id: "when-to-use-virtual-threads",
        title: "Quando usar",
        body:
          "Use virtual threads quando o gargalo e espera por I/O: chamadas HTTP, JDBC, filas, arquivos ou APIs externas. Elas preservam o modelo simples de uma thread por requisicao, mas custam muito menos que platform threads. Nao espere ganhos em CPU-bound puro; nesse caso o limite continua sendo numero de nucleos e eficiencia do algoritmo.",
      },
      {
        id: "pinning-and-blocking",
        title: "Pinning e bloqueios",
        body:
          "Virtual threads podem ser temporariamente presas a uma platform thread quando executam dentro de blocos synchronized ou chamadas nativas bloqueantes. Prefira ReentrantLock, evite synchronized em trechos longos e monitore pinning com logs da JVM ao migrar sistemas de alta concorrencia.",
      },
      {
        id: "executor-model",
        title: "Modelo de executor",
        body:
          "O padrao recomendado e criar virtual threads por tarefa. Em servidores modernos, frameworks podem fazer isso por requisicao. Para codigo proprio, Executors.newVirtualThreadPerTaskExecutor simplifica fan-out de chamadas bloqueantes e melhora legibilidade.",
      },
    ],
    code: {
      title: "Fan-out de chamadas bloqueantes",
      language: "java",
      body: `import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.util.List;
import java.util.concurrent.Executors;

public class Prices {
  static final HttpClient client = HttpClient.newHttpClient();

  public static void main(String[] args) throws Exception {
    var urls = List.of(
        "https://api.example.com/products/1",
        "https://api.example.com/products/2",
        "https://api.example.com/products/3"
    );

    try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
      var tasks = urls.stream()
          .map(url -> executor.submit(() -> fetch(url)))
          .toList();

      for (var task : tasks) {
        System.out.println(task.get());
      }
    }
  }

  static String fetch(String url) throws Exception {
    var request = HttpRequest.newBuilder(URI.create(url)).build();
    return client.send(request, java.net.http.HttpResponse.BodyHandlers.ofString()).body();
  }
}`,
    },
    related: [
      ["Structured Concurrency", "Combine virtual threads com escopos de tarefas."],
      ["Scoped Values", "Propague contexto sem ThreadLocal pesado."],
      ["Generational ZGC", "Otimize latencia quando a concorrencia cresce."],
    ],
  },
  {
    id: "structured-concurrency",
    label: "Structured Concurrency",
    group: "Concorrencia",
    icon: "layers",
    kicker: "JEP 453 Preview",
    title: "Structured Concurrency",
    intro:
      "Um modelo preview para tratar varias tarefas concorrentes como uma unica unidade de trabalho com lifecycle claro.",
    sections: [
      {
        id: "structured-goal",
        title: "Problema que resolve",
        body:
          "Codigo com varios Future soltos e dificil de cancelar, observar e debugar. Structured concurrency cria um escopo onde subtarefas nascem, terminam e falham juntas, deixando claro quem e responsavel por cancelar o restante quando uma tarefa falha ou quando o resultado ja foi encontrado.",
      },
      {
        id: "failure-policy",
        title: "Politica de falha",
        body:
          "Use ShutdownOnFailure quando todas as respostas sao necessarias e qualquer erro invalida o resultado. Use ShutdownOnSuccess quando voce precisa do primeiro resultado valido, como consultar replicas ou provedores equivalentes.",
      },
      {
        id: "production-status",
        title: "Status em Java 21",
        body:
          "Em Java 21 o recurso e preview. Ele e excelente para prototipos e servicos internos, mas deve ser usado conscientemente em producao porque a API pode evoluir em versoes posteriores.",
      },
    ],
    code: {
      title: "Consultar perfil e pedidos em paralelo",
      language: "java",
      body: `import java.util.concurrent.StructuredTaskScope;

record User(String id, String name) {}
record Orders(int count) {}
record Dashboard(User user, Orders orders) {}

public class DashboardService {
  Dashboard load(String userId) throws Exception {
    try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
      var userTask = scope.fork(() -> findUser(userId));
      var ordersTask = scope.fork(() -> findOrders(userId));

      scope.join();
      scope.throwIfFailed();

      return new Dashboard(userTask.get(), ordersTask.get());
    }
  }

  User findUser(String id) { return new User(id, "Ana"); }
  Orders findOrders(String id) { return new Orders(42); }
}`,
    },
    related: [
      ["Virtual Threads", "Base ideal para subtarefas bloqueantes."],
      ["Scoped Values", "Contexto imutavel dentro do escopo."],
      ["Overview", "Veja como habilitar recursos preview."],
    ],
  },
  {
    id: "scoped-values",
    label: "Scoped Values",
    group: "Concorrencia",
    icon: "code",
    kicker: "JEP 446 Preview",
    title: "Scoped Values",
    intro:
      "Um mecanismo preview para compartilhar contexto imutavel dentro de um escopo de execucao, substituindo muitos usos de ThreadLocal.",
    sections: [
      {
        id: "scoped-vs-threadlocal",
        title: "Por que nao ThreadLocal?",
        body:
          "ThreadLocal foi criado para platform threads long-lived e pode causar vazamentos quando usado como contexto global. Com virtual threads, criar muitos ThreadLocal aumenta custo e complexidade. Scoped values sao imutaveis, visiveis apenas dentro do escopo e funcionam melhor com concorrencia estruturada.",
      },
      {
        id: "context-boundary",
        title: "Fronteira de contexto",
        body:
          "Use scoped values para request id, tenant, usuario autenticado ou configuracao de chamada. Nao use para estado mutavel ou acumuladores; se o valor precisa mudar, passe explicitamente como parametro ou retorne um objeto.",
      },
      {
        id: "observability",
        title: "Observabilidade",
        body:
          "Como o contexto e lexical, fica mais facil descobrir onde um valor entra e sai. Isso reduz bugs comuns de ThreadLocal esquecido entre requisicoes e torna logs correlacionados mais previsiveis.",
      },
    ],
    code: {
      title: "Propagando request id",
      language: "java",
      body: `public class RequestContext {
  static final ScopedValue<String> REQUEST_ID = ScopedValue.newInstance();

  public static void main(String[] args) {
    ScopedValue.where(REQUEST_ID, "req-123")
        .run(() -> {
          log("inicio");
          callService();
        });
  }

  static void callService() {
    log("chamando servico");
  }

  static void log(String message) {
    System.out.printf("[%s] %s%n", REQUEST_ID.get(), message);
  }
}`,
    },
    related: [
      ["Virtual Threads", "Evite ThreadLocal pesado em grande escala."],
      ["Structured Concurrency", "Combine contexto e lifecycle de tarefas."],
      ["Unnamed Classes", "Use em exemplos pequenos com preview habilitado."],
    ],
  },
  {
    id: "switch-patterns",
    label: "Pattern switch",
    group: "Linguagem",
    icon: "code",
    kicker: "JEP 441",
    title: "Pattern Matching for switch",
    intro:
      "Switch agora aceita patterns e guards, tornando branching por tipo mais expressivo, seguro e legivel.",
    sections: [
      {
        id: "type-tests",
        title: "Testes de tipo com binding",
        body:
          "Em vez de combinar instanceof com cast manual, o switch faz o teste de tipo e cria a variavel ja tipada. Isso reduz boilerplate e centraliza a logica de decisao em uma expressao unica.",
      },
      {
        id: "guards",
        title: "Guards com when",
        body:
          "Use guards para refinar um pattern com uma condicao. Isso evita if aninhado dentro do case e deixa regras de negocio mais proximas da declaracao do tipo aceito.",
      },
      {
        id: "exhaustiveness",
        title: "Exaustividade",
        body:
          "Com sealed classes e enums, o compilador consegue verificar se todos os casos foram tratados. Isso transforma mudancas de dominio em erros de compilacao, um ganho forte para modelagem rica.",
      },
    ],
    code: {
      title: "Precificacao por tipo de evento",
      language: "java",
      body: `sealed interface Event permits Purchase, Refund, Login {}
record Purchase(String user, double amount) implements Event {}
record Refund(String user, double amount) implements Event {}
record Login(String user) implements Event {}

class BillingRules {
  static String classify(Event event) {
    return switch (event) {
      case Purchase p when p.amount() > 1_000 -> "high-value-purchase";
      case Purchase p -> "purchase";
      case Refund r when r.amount() > 500 -> "review-refund";
      case Refund r -> "refund";
      case Login l -> "activity";
    };
  }
}`,
    },
    related: [
      ["Record Patterns", "Desestruture records dentro dos cases."],
      ["Unnamed Patterns", "Ignore partes irrelevantes do match."],
      ["Sequenced Collections", "Use APIs mais expressivas no codigo resultante."],
    ],
  },
  {
    id: "record-patterns",
    label: "Record Patterns",
    group: "Linguagem",
    icon: "fileCode",
    kicker: "JEP 440",
    title: "Record Patterns",
    intro:
      "Desestruture records diretamente em instanceof e switch, inclusive com patterns aninhados.",
    sections: [
      {
        id: "deconstruction",
        title: "Desestruturacao",
        body:
          "Records ja modelam dados imutaveis. Record patterns completam essa historia permitindo extrair campos com tipo correto no proprio pattern. O resultado e menos getter repetido e mais foco no formato do dado.",
      },
      {
        id: "nested-domain",
        title: "Dominio aninhado",
        body:
          "Patterns aninhados sao uteis quando voce modela objetos pequenos e compostos, como coordenadas, dinheiro, endereco, eventos e comandos. Eles ajudam a expressar que uma regra depende da forma completa do dado, nao apenas de um campo isolado.",
      },
      {
        id: "null-and-totality",
        title: "Null e totalidade",
        body:
          "Patterns nao fazem match com null automaticamente. Trate null de forma explicita quando ele faz parte da entrada possivel ou elimine null do dominio com validacao na borda.",
      },
    ],
    code: {
      title: "Validacao com records aninhados",
      language: "java",
      body: `record Money(String currency, long cents) {}
record Customer(String id, String tier) {}
record Order(Customer customer, Money total) {}

class Discounts {
  static long discount(Order order) {
    return switch (order) {
      case Order(Customer(var id, "VIP"), Money("BRL", var cents))
          when cents > 50_000 -> 10_000;
      case Order(Customer(var id, "VIP"), Money("BRL", var cents)) -> 2_500;
      case Order(var customer, Money("BRL", var cents)) when cents > 100_000 -> 5_000;
      default -> 0;
    };
  }
}`,
    },
    related: [
      ["Pattern switch", "Use record patterns dentro de switch."],
      ["Unnamed Patterns", "Ignore campos que nao importam."],
      ["Unnamed Classes", "Crie exemplos pequenos para ensinar patterns."],
    ],
  },
  {
    id: "sequenced-collections",
    label: "Sequenced Collections",
    group: "Linguagem",
    icon: "layers",
    kicker: "JEP 431",
    title: "Sequenced Collections",
    intro:
      "Novas interfaces padronizam colecoes com ordem definida e acesso ao primeiro, ultimo e ordem reversa.",
    sections: [
      {
        id: "why-sequenced",
        title: "Por que isso faltava?",
        body:
          "Antes de Java 21, List, LinkedHashSet e SortedSet tinham ordem, mas nao compartilhavam uma API uniforme para primeiro e ultimo elemento. SequencedCollection, SequencedSet e SequencedMap corrigem essa lacuna sem exigir casts ou codigo especifico por implementacao.",
      },
      {
        id: "first-last",
        title: "Primeiro e ultimo",
        body:
          "Use getFirst, getLast, addFirst, addLast, removeFirst e removeLast quando a ordem faz parte do contrato. Isso deixa claro que o codigo depende de sequencia, nao apenas de pertencimento.",
      },
      {
        id: "reversed-views",
        title: "Views reversas",
        body:
          "reversed retorna uma view em ordem inversa. Em vez de copiar e inverter listas, voce pode percorrer a colecao na direcao oposta preservando intencao e reduzindo alocacoes.",
      },
    ],
    code: {
      title: "Processar eventos recentes",
      language: "java",
      body: `import java.util.LinkedHashMap;
import java.util.SequencedMap;

record Event(String id, String type) {}

class EventWindow {
  private final SequencedMap<String, Event> events = new LinkedHashMap<>();

  void append(Event event) {
    events.putLast(event.id(), event);
    if (events.size() > 100) {
      events.pollFirstEntry();
    }
  }

  Event newest() {
    return events.lastEntry().getValue();
  }

  void replayNewestFirst() {
    events.reversed().values().forEach(System.out::println);
  }
}`,
    },
    related: [
      ["Pattern switch", "Combine APIs mais claras com branching moderno."],
      ["Record Patterns", "Modele eventos como records."],
      ["Overview", "Veja quais recursos sao finais."],
    ],
  },
  {
    id: "string-templates",
    label: "String Templates",
    group: "Linguagem Preview",
    icon: "lightbulb",
    kicker: "JEP 430 Preview",
    title: "String Templates",
    intro:
      "Um recurso preview para interpolacao segura e processavel de strings, evitando concatenacao manual e abrindo espaco para validadores.",
    sections: [
      {
        id: "template-processors",
        title: "Processadores",
        body:
          "String templates nao sao apenas interpolacao. Eles passam por processadores, como STR, e podem ser customizados para validar SQL, JSON, HTML ou mensagens antes de produzir uma String final.",
      },
      {
        id: "safety",
        title: "Seguranca",
        body:
          "O maior valor esta em impedir que strings estruturadas sejam montadas sem validacao. Em vez de concatenar SQL ou JSON, um processador pode escapar valores, verificar sintaxe e rejeitar entradas invalidas.",
      },
      {
        id: "preview-caution",
        title: "Cuidado com preview",
        body:
          "A sintaxe e API podem mudar depois do Java 21. Use para experimentar, bibliotecas internas ou codigo de estudo, sempre com --enable-preview e uma estrategia clara de upgrade.",
      },
    ],
    code: {
      title: "Interpolacao com STR",
      language: "java",
      body: `public class Templates {
  public static void main(String[] args) {
    String name = "Ana";
    int unread = 7;

    String message = STR."Ola \\{name}, voce tem \\{unread} mensagens.";
    System.out.println(message);

    double total = 129.9;
    String json = STR."""
        {
          "customer": "\\{name}",
          "total": \\{total}
        }
        """;
    System.out.println(json);
  }
}`,
    },
    related: [
      ["Unnamed Classes", "Otimo para exemplos rapidos com preview."],
      ["Pattern switch", "Use em mensagens derivadas de tipos."],
      ["Overview", "Veja como compilar com --enable-preview."],
    ],
  },
  {
    id: "unnamed-patterns",
    label: "Unnamed Patterns",
    group: "Linguagem Preview",
    icon: "fileCode",
    kicker: "JEP 443 Preview",
    title: "Unnamed Patterns and Variables",
    intro:
      "Um recurso preview para marcar variaveis e partes de patterns que existem estruturalmente, mas nao serao usadas.",
    sections: [
      {
        id: "intentional-ignored",
        title: "Ignorar com intencao",
        body:
          "O underscore comunica ao leitor e ao compilador que um valor foi ignorado de proposito. Isso reduz warnings, evita nomes artificiais como unused ou ignored e deixa patterns complexos mais legiveis.",
      },
      {
        id: "record-patterns-fit",
        title: "Com record patterns",
        body:
          "Quando voce desestrutura um record mas so precisa de alguns campos, unnamed patterns evitam poluir o escopo com variaveis irrelevantes. O codigo passa a destacar somente os valores usados na regra.",
      },
      {
        id: "try-with-resources",
        title: "Variaveis locais",
        body:
          "Unnamed variables tambem ajudam em loops, catch e try-with-resources quando o valor precisa existir por contrato da linguagem, mas nao e consultado pelo codigo.",
      },
    ],
    code: {
      title: "Ignorando campos irrelevantes",
      language: "java",
      body: `record Point(int x, int y) {}
record Rectangle(Point topLeft, Point bottomRight) {}

class Geometry {
  static boolean startsAtOrigin(Object shape) {
    return switch (shape) {
      case Rectangle(Point(0, 0), _) -> true;
      case Rectangle(_, _) -> false;
      default -> false;
    };
  }

  static void count(Iterable<String> values) {
    int total = 0;
    for (var _ : values) {
      total++;
    }
    System.out.println(total);
  }
}`,
    },
    related: [
      ["Record Patterns", "Desestruture apenas o que importa."],
      ["Pattern switch", "Use em cases mais expressivos."],
      ["String Templates", "Outro recurso preview de linguagem."],
    ],
  },
  {
    id: "unnamed-classes",
    label: "Unnamed Classes",
    group: "Linguagem Preview",
    icon: "rocket",
    kicker: "JEP 445 Preview",
    title: "Unnamed Classes and Instance Main",
    intro:
      "Um recurso preview para reduzir cerimonia em programas pequenos, aulas, scripts e exemplos de documentacao.",
    sections: [
      {
        id: "learning-curve",
        title: "Menos cerimonia",
        body:
          "Iniciantes nao precisam entender public class, static, arrays e modificadores antes de escrever o primeiro programa. Para documentacao tecnica, isso deixa exemplos focados no recurso ensinado.",
      },
      {
        id: "not-for-large-apps",
        title: "Nao e para aplicacoes grandes",
        body:
          "Use unnamed classes para exemplos, scripts pequenos e ensino. Em sistemas reais, classes nomeadas continuam sendo o formato certo para modularidade, teste, package structure e manutencao.",
      },
      {
        id: "instance-main",
        title: "Instance main",
        body:
          "Java 21 permite main de instancia em preview. Isso reduz a distancia entre codigo de exemplo e codigo orientado a objeto sem exigir que tudo seja static desde o primeiro arquivo.",
      },
    ],
    code: {
      title: "Hello Java 21 sem classe nomeada",
      language: "java",
      body: `void main() {
  var names = List.of("Ana", "Bruno", "Carla");

  for (var name : names) {
    println(STR."Ola, \\{name}!");
  }
}`,
    },
    related: [
      ["String Templates", "Combine para exemplos didaticos."],
      ["Sequenced Collections", "Mostre APIs novas com menos boilerplate."],
      ["Overview", "Compile com --enable-preview."],
    ],
  },
  {
    id: "ffm-api",
    label: "FFM API",
    group: "APIs e Runtime",
    icon: "code",
    kicker: "JEP 442 Preview",
    title: "Foreign Function and Memory API",
    intro:
      "API preview para chamar codigo nativo e acessar memoria fora do heap com mais seguranca que JNI.",
    sections: [
      {
        id: "jni-alternative",
        title: "Alternativa ao JNI",
        body:
          "JNI e poderoso, mas verboso e facil de errar. FFM oferece API Java para localizar simbolos nativos, modelar layouts de memoria e controlar ciclo de vida com Arena, tornando integracoes nativas mais explicitas.",
      },
      {
        id: "native-memory",
        title: "Memoria nativa",
        body:
          "MemorySegment representa uma regiao de memoria com limites conhecidos. Isso reduz riscos de acesso fora de faixa e melhora a clareza sobre quem aloca e quem libera recursos.",
      },
      {
        id: "where-it-fits",
        title: "Onde usar",
        body:
          "Use quando precisar integrar bibliotecas C, engines locais, codecs, bancos embarcados ou rotinas de alto desempenho. Para uso comum de sistema operacional, prefira APIs Java padrao quando existirem.",
      },
    ],
    code: {
      title: "Chamar strlen da libc",
      language: "java",
      body: `import java.lang.foreign.Arena;
import java.lang.foreign.FunctionDescriptor;
import java.lang.foreign.Linker;
import java.lang.foreign.SymbolLookup;
import java.lang.foreign.ValueLayout;

class NativeStringLength {
  public static void main(String[] args) throws Throwable {
    var linker = Linker.nativeLinker();
    var strlen = linker.downcallHandle(
        SymbolLookup.loaderLookup().find("strlen").orElseThrow(),
        FunctionDescriptor.of(ValueLayout.JAVA_LONG, ValueLayout.ADDRESS)
    );

    try (var arena = Arena.ofConfined()) {
      var cString = arena.allocateUtf8String("java-21");
      long length = (long) strlen.invoke(cString);
      System.out.println(length);
    }
  }
}`,
    },
    related: [
      ["Vector API", "Outra API para cenarios de performance."],
      ["Generational ZGC", "Runtime moderno para workloads exigentes."],
      ["Overview", "Recurso preview em Java 21."],
    ],
  },
  {
    id: "generational-zgc",
    label: "Generational ZGC",
    group: "APIs e Runtime",
    icon: "zap",
    kicker: "JEP 439",
    title: "Generational ZGC",
    intro:
      "Evolucao do Z Garbage Collector que separa objetos jovens e antigos para melhorar eficiencia mantendo baixa latencia.",
    sections: [
      {
        id: "why-generational",
        title: "Por que geracional?",
        body:
          "A maioria dos objetos morre jovem. Um coletor geracional explora esse padrao coletando objetos recentes com mais frequencia e mantendo objetos antigos em uma area separada. Isso reduz trabalho total e pode melhorar throughput sem sacrificar pausas baixas.",
      },
      {
        id: "latency-profile",
        title: "Perfil de latencia",
        body:
          "ZGC e voltado para heaps grandes e SLAs sensiveis a pausa. Em Java 21, generational ZGC torna essa escolha mais competitiva para servicos de baixa latencia, APIs com muitos objetos temporarios e aplicacoes com picos de alocacao.",
      },
      {
        id: "operational-rollout",
        title: "Rollout operacional",
        body:
          "Teste com metricas reais: pause time, allocation rate, CPU, throughput e memoria residente. Nao troque GC no escuro; compare contra G1 ou o coletor atual usando carga representativa.",
      },
    ],
    code: {
      title: "Executar com Generational ZGC",
      language: "bash",
      body: `java -XX:+UseZGC -XX:+ZGenerational -jar app.jar

# Metricas uteis durante teste:
java -Xlog:gc*,safepoint:file=gc.log:time,uptime,level,tags \\
  -XX:+UseZGC -XX:+ZGenerational \\
  -jar app.jar`,
    },
    related: [
      ["Virtual Threads", "Mais concorrencia pode aumentar alocacoes temporarias."],
      ["FFM API", "Memoria nativa exige observabilidade separada."],
      ["Overview", "Planeje migracao com benchmark."],
    ],
  },
  {
    id: "kem-api",
    label: "KEM API",
    group: "APIs e Runtime",
    icon: "fileCode",
    kicker: "JEP 452",
    title: "Key Encapsulation Mechanism API",
    intro:
      "API para mecanismos de encapsulamento de chaves, importante para protocolos modernos e criptografia hibrida.",
    sections: [
      {
        id: "what-is-kem",
        title: "O que e KEM?",
        body:
          "KEM permite que duas partes estabelecam material secreto usando chave publica sem transmitir diretamente a chave compartilhada. Ele aparece em protocolos modernos e em estrategias de criptografia hibrida, inclusive em caminhos para algoritmos pos-quanticos.",
      },
      {
        id: "api-shape",
        title: "Formato da API",
        body:
          "A API expoe encapsulador e desencapsulador. Um lado cria uma chave secreta e um encapsulamento publico; o outro usa sua chave privada para recuperar a mesma chave secreta a partir do encapsulamento.",
      },
      {
        id: "where-to-use",
        title: "Onde usar",
        body:
          "Use em bibliotecas de seguranca, protocolos customizados e integracoes que precisam de acordo de chaves moderno. Para aplicacoes comuns, prefira TLS e bibliotecas maduras em vez de montar protocolo criptografico proprio.",
      },
    ],
    code: {
      title: "Fluxo conceitual de KEM",
      language: "java",
      body: `import javax.crypto.KEM;
import java.security.KeyPairGenerator;

class KemExample {
  public static void main(String[] args) throws Exception {
    var generator = KeyPairGenerator.getInstance("X25519");
    var receiver = generator.generateKeyPair();

    var kem = KEM.getInstance("DHKEM");
    var encapsulator = kem.newEncapsulator(receiver.getPublic());
    var encapsulated = encapsulator.encapsulate();

    var decapsulator = kem.newDecapsulator(receiver.getPrivate());
    var recovered = decapsulator.decapsulate(encapsulated.encapsulation());

    System.out.println(encapsulated.key().getAlgorithm());
    System.out.println(recovered.getAlgorithm());
  }
}`,
    },
    related: [
      ["FFM API", "Integre bibliotecas nativas somente quando necessario."],
      ["Overview", "Separe recursos finais de previews."],
      ["Generational ZGC", "Observe runtime em workloads criticos."],
    ],
  },
  {
    id: "vector-api",
    label: "Vector API",
    group: "APIs e Runtime",
    icon: "rocket",
    kicker: "JEP 448 Incubator",
    title: "Vector API",
    intro:
      "API incubadora para expressar computacao vetorial portavel e deixar a JVM mapear para instrucoes SIMD do hardware.",
    sections: [
      {
        id: "simd-use-cases",
        title: "Casos de uso",
        body:
          "Use Vector API para loops numericos intensivos: processamento de imagem, codecs, machine learning, analise de series, criptografia e transformacoes em arrays. Ela nao substitui colecoes comuns nem melhora automaticamente codigo orientado a objetos.",
      },
      {
        id: "species",
        title: "Species e portabilidade",
        body:
          "VectorSpecies representa a forma vetorial preferida para um tipo no hardware atual. Isso permite escrever codigo portavel e deixar a JVM escolher largura de vetor eficiente.",
      },
      {
        id: "incubator-warning",
        title: "Status incubator",
        body:
          "Em Java 21 a API ainda e incubadora. Ela exige modulo jdk.incubator.vector e pode mudar. Use em bibliotecas de performance com benchmark e fallback escalar.",
      },
    ],
    code: {
      title: "Soma vetorizada de arrays",
      language: "java",
      body: `import jdk.incubator.vector.FloatVector;
import jdk.incubator.vector.VectorSpecies;

class VectorSum {
  static final VectorSpecies<Float> SPECIES = FloatVector.SPECIES_PREFERRED;

  static void add(float[] a, float[] b, float[] out) {
    int i = 0;
    int upperBound = SPECIES.loopBound(a.length);

    for (; i < upperBound; i += SPECIES.length()) {
      var va = FloatVector.fromArray(SPECIES, a, i);
      var vb = FloatVector.fromArray(SPECIES, b, i);
      va.add(vb).intoArray(out, i);
    }

    for (; i < a.length; i++) {
      out[i] = a[i] + b[i];
    }
  }
}`,
    },
    related: [
      ["Generational ZGC", "Performance tambem depende de GC e alocacao."],
      ["FFM API", "Compare com bibliotecas nativas antes de decidir."],
      ["Overview", "Recurso incubator em Java 21."],
    ],
  },
];
