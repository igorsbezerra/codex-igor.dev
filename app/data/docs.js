export const docs = [
  {
    id: "overview",
    label: "Overview",
    group: "Java 21",
    icon: "book",
    kicker: "Java 21 LTS",
    title: "Java 21 Deep Dive",
    intro:
      "Um guia prático sobre as principais novidades do Java 21, com foco em quando usar cada recurso e como aplicá-lo em código real.",
    sections: [
      {
        id: "why-java-21",
        title: "Por que Java 21 importa?",
        body:
          "Java 21 é uma versão LTS que consolida recursos de linguagem, concorrência e runtime vindos de vários ciclos anteriores. Ela é especialmente importante para sistemas de backend porque combina virtual threads, pattern matching, record patterns e melhorias de coleções em uma base estável para modernizar código sem abandonar o ecossistema JVM.",
      },
      {
        id: "migration-strategy",
        title: "Estratégia de migração",
        body:
          "A migração ideal começa pelo runtime e build pipeline, depois habilita recursos finais da linguagem e por último avalia previews com flags explícitas. Em aplicações Spring, Quarkus ou Micronaut, o maior ganho inicial costuma vir de virtual threads para workloads bloqueantes e de pattern matching para reduzir código defensivo.",
      },
      {
        id: "preview-vs-final",
        title: "Recursos finais e preview",
        body:
          "Virtual threads, pattern matching for switch, record patterns e sequenced collections estão finais. String templates, unnamed patterns, unnamed classes, scoped values, structured concurrency e FFM ainda são preview/incubator em Java 21 e exigem --enable-preview quando usados em produção experimental ou estudos.",
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
      ["Virtual Threads", "Comece por aqui se sua aplicação faz muito I/O bloqueante."],
      ["Pattern switch", "Modernize condicionais e reduza casts manuais."],
      ["Sequenced Collections", "Padronize acesso ao primeiro e último elemento."],
    ],
  },
  {
    id: "virtual-threads",
    label: "Virtual Threads",
    group: "Concorrência",
    icon: "rocket",
    kicker: "JEP 444",
    title: "Virtual Threads",
    intro:
      "Threads leves gerenciadas pela JVM para aumentar throughput em workloads bloqueantes sem escrever código reativo complexo.",
    sections: [
      {
        id: "when-to-use-virtual-threads",
        title: "Quando usar",
        body:
          "Use virtual threads quando o gargalo é espera por I/O: chamadas HTTP, JDBC, filas, arquivos ou APIs externas. Elas preservam o modelo simples de uma thread por requisição, mas custam muito menos que platform threads. Não espere ganhos em CPU-bound puro; nesse caso o limite continua sendo número de núcleos e eficiência do algoritmo.",
      },
      {
        id: "pinning-and-blocking",
        title: "Pinning e bloqueios",
        body:
          "Virtual threads podem ser temporariamente presas a uma platform thread quando executam dentro de blocos synchronized ou chamadas nativas bloqueantes. Prefira ReentrantLock, evite synchronized em trechos longos e monitore pinning com logs da JVM ao migrar sistemas de alta concorrência.",
      },
      {
        id: "executor-model",
        title: "Modelo de executor",
        body:
          "O padrão recomendado é criar virtual threads por tarefa. Em servidores modernos, frameworks podem fazer isso por requisição. Para código próprio, Executors.newVirtualThreadPerTaskExecutor simplifica fan-out de chamadas bloqueantes e melhora legibilidade.",
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
      ["Generational ZGC", "Otimize latência quando a concorrência cresce."],
    ],
  },
  {
    id: "structured-concurrency",
    label: "Structured Concurrency",
    group: "Concorrência",
    icon: "layers",
    kicker: "JEP 453 Preview",
    title: "Structured Concurrency",
    intro:
      "Um modelo preview para tratar várias tarefas concorrentes como uma única unidade de trabalho com lifecycle claro.",
    sections: [
      {
        id: "structured-goal",
        title: "Problema que resolve",
        body:
          "Código com vários Future soltos e difícil de cancelar, observar e debugar. Structured concurrency cria um escopo onde subtarefas nascem, terminam e falham juntas, deixando claro quem é responsável por cancelar o restante quando uma tarefa falha ou quando o resultado já foi encontrado.",
      },
      {
        id: "failure-policy",
        title: "Política de falha",
        body:
          "Use ShutdownOnFailure quando todas as respostas são necessárias e qualquer erro invalida o resultado. Use ShutdownOnSuccess quando você precisa do primeiro resultado válido, como consultar réplicas ou provedores equivalentes.",
      },
      {
        id: "production-status",
        title: "Status em Java 21",
        body:
          "Em Java 21 o recurso é preview. Ele é excelente para protótipos e serviços internos, mas deve ser usado conscientemente em produção porque a API pode evoluir em versões posteriores.",
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
      ["Scoped Values", "Contexto imutável dentro do escopo."],
      ["Overview", "Veja como habilitar recursos preview."],
    ],
  },
  {
    id: "scoped-values",
    label: "Scoped Values",
    group: "Concorrência",
    icon: "code",
    kicker: "JEP 446 Preview",
    title: "Scoped Values",
    intro:
      "Um mecanismo preview para compartilhar contexto imutável dentro de um escopo de execução, substituindo muitos usos de ThreadLocal.",
    sections: [
      {
        id: "scoped-vs-threadlocal",
        title: "Por que não ThreadLocal?",
        body:
          "ThreadLocal foi criado para platform threads long-lived e pode causar vazamentos quando usado como contexto global. Com virtual threads, criar muitos ThreadLocal aumenta custo e complexidade. Scoped values são imutáveis, visíveis apenas dentro do escopo e funcionam melhor com concorrência estruturada.",
      },
      {
        id: "context-boundary",
        title: "Fronteira de contexto",
        body:
          "Use scoped values para request id, tenant, usuário autenticado ou configuração de chamada. Não use para estado mutável ou acumuladores; se o valor precisa mudar, passe explicitamente como parâmetro ou retorne um objeto.",
      },
      {
        id: "observability",
        title: "Observabilidade",
        body:
          "Como o contexto é lexical, fica mais fácil descobrir onde um valor entra e sai. Isso reduz bugs comuns de ThreadLocal esquecido entre requisições e torna logs correlacionados mais previsíveis.",
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
      "Switch agora aceita patterns e guards, tornando branching por tipo mais expressivo, seguro e legível.",
    sections: [
      {
        id: "type-tests",
        title: "Testes de tipo com binding",
        body:
          "Em vez de combinar instanceof com cast manual, o switch faz o teste de tipo e cria a variável já tipada. Isso reduz boilerplate e centraliza a lógica de decisão em uma expressão única.",
      },
      {
        id: "guards",
        title: "Guards com when",
        body:
          "Use guards para refinar um pattern com uma condição. Isso evita if aninhado dentro do case e deixa regras de negócio mais próximas da declaração do tipo aceito.",
      },
      {
        id: "exhaustiveness",
        title: "Exaustividade",
        body:
          "Com sealed classes e enums, o compilador consegue verificar se todos os casos foram tratados. Isso transforma mudanças de domínio em erros de compilação, um ganho forte para modelagem rica.",
      },
    ],
    code: {
      title: "Precificação por tipo de evento",
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
      ["Sequenced Collections", "Use APIs mais expressivas no código resultante."],
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
        title: "Desestruturação",
        body:
          "Records já modelam dados imutáveis. Record patterns completam essa história permitindo extrair campos com tipo correto no próprio pattern. O resultado é menos getter repetido e mais foco no formato do dado.",
      },
      {
        id: "nested-domain",
        title: "Domínio aninhado",
        body:
          "Patterns aninhados são úteis quando você modela objetos pequenos e compostos, como coordenadas, dinheiro, endereço, eventos e comandos. Eles ajudam a expressar que uma regra depende da forma completa do dado, não apenas de um campo isolado.",
      },
      {
        id: "null-and-totality",
        title: "Null e totalidade",
        body:
          "Patterns não fazem match com null automaticamente. Trate null de forma explícita quando ele faz parte da entrada possível ou elimine null do domínio com validação na borda.",
      },
    ],
    code: {
      title: "Validação com records aninhados",
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
      ["Unnamed Patterns", "Ignore campos que não importam."],
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
      "Novas interfaces padronizam coleções com ordem definida e acesso ao primeiro, último e ordem reversa.",
    sections: [
      {
        id: "why-sequenced",
        title: "Por que isso faltava?",
        body:
          "Antes de Java 21, List, LinkedHashSet e SortedSet tinham ordem, mas não compartilhavam uma API uniforme para primeiro e último elemento. SequencedCollection, SequencedSet e SequencedMap corrigem essa lacuna sem exigir casts ou código específico por implementação.",
      },
      {
        id: "first-last",
        title: "Primeiro e último",
        body:
          "Use getFirst, getLast, addFirst, addLast, removeFirst e removeLast quando a ordem faz parte do contrato. Isso deixa claro que o código depende de sequência, não apenas de pertencimento.",
      },
      {
        id: "reversed-views",
        title: "Views reversas",
        body:
          "reversed retorna uma view em ordem inversa. Em vez de copiar e inverter listas, você pode percorrer a coleção na direção oposta preservando intenção e reduzindo alocações.",
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
      ["Overview", "Veja quais recursos são finais."],
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
      "Um recurso preview para interpolação segura e processável de strings, evitando concatenação manual e abrindo espaço para validadores.",
    sections: [
      {
        id: "template-processors",
        title: "Processadores",
        body:
          "String templates não são apenas interpolação. Eles passam por processadores, como STR, e podem ser customizados para validar SQL, JSON, HTML ou mensagens antes de produzir uma String final.",
      },
      {
        id: "safety",
        title: "Segurança",
        body:
          "O maior valor está em impedir que strings estruturadas sejam montadas sem validação. Em vez de concatenar SQL ou JSON, um processador pode escapar valores, verificar sintaxe e rejeitar entradas inválidas.",
      },
      {
        id: "preview-caution",
        title: "Cuidado com preview",
        body:
          "A sintaxe e a API podem mudar depois do Java 21. Use para experimentar, bibliotecas internas ou código de estudo, sempre com --enable-preview e uma estratégia clara de upgrade.",
      },
    ],
    code: {
      title: "Interpolação com STR",
      language: "java",
      body: `public class Templates {
  public static void main(String[] args) {
    String name = "Ana";
    int unread = 7;

    String message = STR."Olá \\{name}, você tem \\{unread} mensagens.";
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
      ["Unnamed Classes", "Ótimo para exemplos rápidos com preview."],
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
      "Um recurso preview para marcar variáveis e partes de patterns que existem estruturalmente, mas não serão usadas.",
    sections: [
      {
        id: "intentional-ignored",
        title: "Ignorar com intenção",
        body:
          "O underscore comunica ao leitor e ao compilador que um valor foi ignorado de propósito. Isso reduz warnings, evita nomes artificiais como unused ou ignored e deixa patterns complexos mais legíveis.",
      },
      {
        id: "record-patterns-fit",
        title: "Com record patterns",
        body:
          "Quando você desestrutura um record mas só precisa de alguns campos, unnamed patterns evitam poluir o escopo com variáveis irrelevantes. O código passa a destacar somente os valores usados na regra.",
      },
      {
        id: "try-with-resources",
        title: "Variáveis locais",
        body:
          "Unnamed variables também ajudam em loops, catch e try-with-resources quando o valor precisa existir por contrato da linguagem, mas não é consultado pelo código.",
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
      "Um recurso preview para reduzir cerimônia em programas pequenos, aulas, scripts e exemplos de documentação.",
    sections: [
      {
        id: "learning-curve",
        title: "Menos cerimônia",
        body:
          "Iniciantes não precisam entender public class, static, arrays e modificadores antes de escrever o primeiro programa. Para documentação técnica, isso deixa exemplos focados no recurso ensinado.",
      },
      {
        id: "not-for-large-apps",
        title: "Não é para aplicações grandes",
        body:
          "Use unnamed classes para exemplos, scripts pequenos e ensino. Em sistemas reais, classes nomeadas continuam sendo o formato certo para modularidade, teste, package structure e manutenção.",
      },
      {
        id: "instance-main",
        title: "Instance main",
        body:
          "Java 21 permite main de instância em preview. Isso reduz a distância entre código de exemplo e código orientado a objeto sem exigir que tudo seja static desde o primeiro arquivo.",
      },
    ],
    code: {
      title: "Hello Java 21 sem classe nomeada",
      language: "java",
      body: `void main() {
  var names = List.of("Ana", "Bruno", "Carla");

  for (var name : names) {
    println(STR."Olá, \\{name}!");
  }
}`,
    },
    related: [
      ["String Templates", "Combine para exemplos didáticos."],
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
      "API preview para chamar código nativo e acessar memória fora do heap com mais segurança que JNI.",
    sections: [
      {
        id: "jni-alternative",
        title: "Alternativa ao JNI",
        body:
          "JNI é poderoso, mas verboso e fácil de errar. FFM oferece API Java para localizar símbolos nativos, modelar layouts de memória e controlar ciclo de vida com Arena, tornando integrações nativas mais explícitas.",
      },
      {
        id: "native-memory",
        title: "Memória nativa",
        body:
          "MemorySegment representa uma região de memória com limites conhecidos. Isso reduz riscos de acesso fora de faixa e melhora a clareza sobre quem aloca e quem libera recursos.",
      },
      {
        id: "where-it-fits",
        title: "Onde usar",
        body:
          "Use quando precisar integrar bibliotecas C, engines locais, codecs, bancos embarcados ou rotinas de alto desempenho. Para uso comum de sistema operacional, prefira APIs Java padrão quando existirem.",
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
      ["Vector API", "Outra API para cenários de performance."],
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
      "Evolução do Z Garbage Collector que separa objetos jovens e antigos para melhorar eficiência mantendo baixa latência.",
    sections: [
      {
        id: "why-generational",
        title: "Por que geracional?",
        body:
          "A maioria dos objetos morre jovem. Um coletor geracional explora esse padrão coletando objetos recentes com mais frequência e mantendo objetos antigos em uma área separada. Isso reduz trabalho total e pode melhorar throughput sem sacrificar pausas baixas.",
      },
      {
        id: "latency-profile",
        title: "Perfil de latência",
        body:
          "ZGC é voltado para heaps grandes e SLAs sensíveis a pausa. Em Java 21, generational ZGC torna essa escolha mais competitiva para serviços de baixa latência, APIs com muitos objetos temporários e aplicações com picos de alocação.",
      },
      {
        id: "operational-rollout",
        title: "Rollout operacional",
        body:
          "Teste com métricas reais: pause time, allocation rate, CPU, throughput e memória residente. Não troque GC no escuro; compare contra G1 ou o coletor atual usando carga representativa.",
      },
    ],
    code: {
      title: "Executar com Generational ZGC",
      language: "bash",
      body: `java -XX:+UseZGC -XX:+ZGenerational -jar app.jar

# Métricas úteis durante teste:
java -Xlog:gc*,safepoint:file=gc.log:time,uptime,level,tags \\
  -XX:+UseZGC -XX:+ZGenerational \\
  -jar app.jar`,
    },
    related: [
      ["Virtual Threads", "Mais concorrência pode aumentar alocações temporárias."],
      ["FFM API", "Memória nativa exige observabilidade separada."],
      ["Overview", "Planeje migração com benchmark."],
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
      "API para mecanismos de encapsulamento de chaves, importante para protocolos modernos e criptografia híbrida.",
    sections: [
      {
        id: "what-is-kem",
        title: "O que é KEM?",
        body:
          "KEM permite que duas partes estabeleçam material secreto usando chave pública sem transmitir diretamente a chave compartilhada. Ele aparece em protocolos modernos e em estratégias de criptografia híbrida, inclusive em caminhos para algoritmos pós-quânticos.",
      },
      {
        id: "api-shape",
        title: "Formato da API",
        body:
          "A API expõe encapsulador e desencapsulador. Um lado cria uma chave secreta e um encapsulamento público; o outro usa sua chave privada para recuperar a mesma chave secreta a partir do encapsulamento.",
      },
      {
        id: "where-to-use",
        title: "Onde usar",
        body:
          "Use em bibliotecas de segurança, protocolos customizados e integrações que precisam de acordo de chaves moderno. Para aplicações comuns, prefira TLS e bibliotecas maduras em vez de montar protocolo criptográfico próprio.",
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
      ["FFM API", "Integre bibliotecas nativas somente quando necessário."],
      ["Overview", "Separe recursos finais de previews."],
      ["Generational ZGC", "Observe runtime em workloads críticos."],
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
      "API incubadora para expressar computação vetorial portável e deixar a JVM mapear para instruções SIMD do hardware.",
    sections: [
      {
        id: "simd-use-cases",
        title: "Casos de uso",
        body:
          "Use Vector API para loops numéricos intensivos: processamento de imagem, codecs, machine learning, análise de séries, criptografia e transformações em arrays. Ela não substitui coleções comuns nem melhora automaticamente código orientado a objetos.",
      },
      {
        id: "species",
        title: "Species e portabilidade",
        body:
          "VectorSpecies representa a forma vetorial preferida para um tipo no hardware atual. Isso permite escrever código portável e deixar a JVM escolher largura de vetor eficiente.",
      },
      {
        id: "incubator-warning",
        title: "Status incubator",
        body:
          "Em Java 21 a API ainda é incubadora. Ela exige módulo jdk.incubator.vector e pode mudar. Use em bibliotecas de performance com benchmark e fallback escalar.",
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
      ["Generational ZGC", "Performance também depende de GC e alocação."],
      ["FFM API", "Compare com bibliotecas nativas antes de decidir."],
      ["Overview", "Recurso incubator em Java 21."],
    ],
  },
];
