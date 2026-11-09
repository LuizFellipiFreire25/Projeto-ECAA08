# Aula 21: Árvores Binárias no Mapeamento e Tomada de Decisão do Visão-AGV

## 1. Introdução e Contextualização no Projeto Visão-AGV

No ecossistema do **Visão-AGV / SCADA-Core**, o robô autônomo enfrenta continuamente o desafio de estruturar dados espaciais e tomar decisões em tempo real. Diferente dos grafos gerais utilizados para roteamento de longo curso (Etapa 02), a navegação reativa e a decomposição espacial do piso da fábrica exigem estruturas computacionais rígidas, hierárquicas e com tempo de busca logarítmico.

Uma **Árvore Binária** é uma estrutura de dados não linear na qual cada nó possui no máximo dois filhos, referenciados convencionalmente como *filho esquerdo* e *filho direito*. 

No contexto do AGV, as Árvores Binárias são aplicadas em duas frentes fundamentais:
1. **Decomposição Espacial e Resolução do Grid:** Divisão hierárquica das zonas de operação em sub-regiões (*Quadtrees* simplificadas ou árvores de partição espacial).
2. **Árvores de Decisão Comportamental (*Behavior Trees*):** Estruturação do controle de estados do veículo (ex: verificar carga, avaliar sensores LiDAR, chavear entre navegação nominal e desvio dinâmico).

## 2. Propriedades Matemáticas e Estrutura de Dados

Uma árvore binária $T$ é formalmente definida como um conjunto finito de nós tal que:
- Existe um nó especial chamado **raiz** ($\text{raiz}(T)$).
- Os nós restantes são divididos em dois subconjuntos disjuntos, $T_L$ e $T_R$, que são por sua vez árvores binárias (chamadas de subárvore esquerda e subárvore direita).

### Principais Métrica de Desempenho e Topologia:

- **Profundidade ($h$):** A maior distância da raiz até uma folha. Em uma árvore binária balanceada com $N$ nós, a altura é dada por $h = \lfloor \log_2 N \rfloor$.
- **Capacidade Maxima:** Uma árvore binária cheia de altura $h$ possui no máximo $2^{h+1} - 1$ nós.
- **Complexidade de Busca:** Em árvores balanceadas de busca (BST), operações de inserção, remoção e consulta executam em tempo $O(\log N)$, ideal para respostas de controle em sub-milissegundos no AGV.

## 3. Aplicação 1: Mapeamento Hierárquico de Células de Manufatura

Durante o escaneamento por LiDAR e câmeras estereoscópicas, a representação bidimensional da planta é particionada recursivamente em regiões binárias de ocupação:

```
                  [Zona Total do Galpão]
                     /              \
         [Esquerda: Z-100]      [Direita: Z-200]
           /          \            /          \
    [Livre: Z-101] [Obstáculo] [Livre]      [Doca]
```

- **Nós Folhas:** Representam células unitárias do piso categorizadas como `LIVRE`, `OCUPADO` (obstáculo fixo) ou `PONTO_DE_CARGA`.
- **Nós Internos:** Representam delimitadores geométricos (divisões espaciais de teste na coordenada $X$ ou $Y$).

## 4. Aplicação 2: Travessia de Árvore na Validação de Sensores

Para processar periodicamente as condições de operação do robô, o sistema supervisor do AGV executa algoritmos de travessia (*traversal*) sobre a árvore de verificação de sistemas:

1. **Pré-Ordem (Pre-order - Raiz, Esquerda, Direita):** Utilizado para clonar ou serializar o estado completo dos subsistemas do AGV antes de enviar ao SCADA.
2. **Em-Ordem (In-order - Esquerda, Raiz, Direita):** Em Árvores Binárias de Busca (BST), retorna os dados de leitura de sensores ordenados por prioridade/severidade.
3. **Pós-Ordem (Post-order - Esquerda, Direita, Raiz):** Utilizado para desalocação de memória e liberação encadeada de sub-rotinas de emergência (libera primeiro os atuadores locais, depois os controladores primários).

## 5. Árvores Binárias de Busca (BST) aplicadas à Priorização de Tarefas

Além da representação espacial, a **Árvore Binária de Busca (BST)** garante que a lista de comandos recebidos da fábrica seja organizada dinamicamente de acordo com a urgência ($P$):

$$\forall \, \text{nó } v, \quad \text{chave}(\text{filho\_esquerdo}) < \text{chave}(v) < \text{chave}(\text{filho\_direito})$$

Se o AGV recebe ordens com prioridades distintas ($P=1$: Recarga Crítica, $P=5$: Transporte Padrão, $P=9$: Manutenção preventiva), a BST permite inserir a nova ordem em $O(\log N)$ e resgatar instantaneamente a missão de maior urgência.

## 6. Resumo dos Benefícios no Visão-AGV

- **Navegação Eficiente:** Busca de regiões de tráfego em tempo $O(\log N)$ em vez da varredura linear $O(N)$ em matrizes de ocupação.
- **Estruturação Modular:** Facilidade em chavear comportamentos e regras de segurança na memória do embarcado.
- **Preparo para Mapeamento KD-Tree:** Base conceitual para a busca de vizinhos mais próximos no plano 2D/3D dos pontos lidos pelo sensor LiDAR (assunto das próximas aulas).