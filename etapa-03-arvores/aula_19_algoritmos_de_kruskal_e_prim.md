# Aula 19: Árvores Geradoras Mínimas — Algoritmos de Kruskal e Prim

## 1. Introdução à Etapa 03 (Árvores)
Neste novo módulo, transitamos da análise de grafos gerais (com ciclos e caminhos múltiplos) para o estudo das **Árvores**. Na teoria dos grafos, uma árvore é um grafo conexo e acíclico. Para o controle de veículos autônomos, as árvores são estruturas de dados fundamentais para hierarquizar decisões (árvores de busca) e para desenhar topologias de rede sem redundâncias.

Nesta aula, focaremos no conceito de **Árvore Geradora Mínima** (MST - *Minimum Spanning Tree*), resolvendo problemas de otimização de infraestrutura por meio de algoritmos gulosos: **Kruskal** e **Prim**.

---

## 2. O Problema no Projeto Visão-AGV
Para que a frota de robôs móveis opere com precisão milimétrica, precisamos instalar uma malha de comunicação de baixa latência (ou trilhas de fitas magnéticas de backup) que conecte todas as **células de manufatura**, **estações de recarga** e **pontos de transferência (handoff)** do hub logístico.

**O Desafio:** Como conectar todos os $n$ nós operacionais garantindo que exista um caminho entre qualquer par de estações, mas minimizando a quantidade total de metros de cabos/fitas instalados? 

A resposta matemática para isso é encontrar um subgrafo $T \subseteq G$ tal que:
1. $T$ seja conexo e contenha todos os vértices de $V$.
2. $T$ não possua ciclos (portanto, $T$ é uma árvore com exatos $|V| - 1$ arestas).
3. A soma dos pesos das arestas $\sum_{e \in T} W(e)$ seja a menor possível.

---

## 3. Algoritmo de Kruskal: A Abordagem Baseada em Arestas
O Algoritmo de Kruskal constrói a infraestrutura selecionando os trechos mais curtos de todo o grid de navegação, independentemente de onde eles estejam, desde que não formem um loop (ciclo) desnecessário.

### Lógica de Funcionamento:
1. **Ordenação:** Todas as arestas (corredores possíveis) são ordenadas pelo seu peso $W$ (distância física) em ordem crescente.
2. **Seleção Gulosa:** O algoritmo avalia a aresta mais curta disponível.
3. **Prevenção de Ciclos:** Utiliza-se a estrutura de dados *Union-Find* (Conjuntos Disjuntos). Se a aresta testada conectar duas células de manufatura que já possuem um caminho indireto entre si, a aresta é descartada. Caso contrário, ela é adicionada à MST $T$.

**Complexidade:** O gargalo é a ordenação das arestas, resultando em $O(|E| \log |E|)$.
**Aplicação no AGV:** Excelente quando temos uma visão global prévia (mapa estático do LiDAR) e queremos mapear as vias primárias mais curtas e descentralizadas do layout fabril.

---

## 4. Algoritmo de Prim: A Abordagem Baseada em Vértices
Diferente de Kruskal, o Algoritmo de Prim começa em um "nó raiz" específico e faz a rede de infraestrutura crescer gradativamente, como uma teia se expandindo a partir de um ponto central.

### Lógica de Funcionamento:
1. **Inicialização:** Escolhemos um vértice inicial, por exemplo, a **Estação Base de Recarga do AGV**.
2. **Crescimento:** Observamos todas as arestas que saem dos nós já conectados na árvore $T$ para os nós ainda não visitados.
3. **Seleção Gulosa:** Utilizando uma Fila de Prioridade (Min-Heap), escolhemos a aresta de menor custo que expande a fronteira da nossa rede para uma nova célula de manufatura.
4. Repete-se o processo até que todos os $|V|$ nós estejam conectados.

**Complexidade:** Com Min-Heap, atinge $O(|E| \log |V|)$.
**Aplicação no AGV:** Perfeito para simular a expansão da cobertura de Wi-Fi ou a energização dos trilhos partindo do painel central elétrico da estação base em direção às zonas periféricas de operação.

---

## 5. Kruskal vs. Prim: Síntese Operacional
Ambos os algoritmos resolvem perfeitamente o problema da Árvore Geradora Mínima para o ambiente do AGV, mas com mecânicas diferentes:
* **Kruskal** é ideal para *grids* de navegação esparsos (poucas conexões possíveis entre os pontos).
* **Prim** tem melhor desempenho em layouts densamente conectados e modela fisicamente o "crescimento" contínuo de uma malha a partir da base principal.

No nosso ecossistema **Visão-AGV**, aplicaremos esses algoritmos para gerar o *mapa de infraestrutura primária* — garantindo a conectividade total das zonas logísticas com o menor custo de implantação de hardware no chão de fábrica.