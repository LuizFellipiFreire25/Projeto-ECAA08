# Aula 22: Árvores Aleatórias Exploradas Rapidamente (RRT) na Navegação Reativa do AGV

## 1. Introdução e Contextualização no Projeto Visão-AGV

Na navegação intralogística do **Visão-AGV / SCADA-Core**, os algoritmos de menor caminho em grafos discretos (como Dijkstra e A*, abordados na Etapa 02) dependem de uma malha topológica estática previamente delimitada. No entanto, quando um obstáculo inesperado bloqueia um corredor principal — como um palete caído, uma empilhadeira parada ou um operador em deslocamento —, o veículo precisa calcular uma rota de desvio em tempo real dentro do espaço de configuração contínuo $\mathcal{C}$.

O algoritmo **Rapidly-exploring Random Tree (RRT)** é um método de planejamento de movimento baseado em amostragem estocástica. Ele constrói incrementalmente uma árvore de busca que explora rapidamente regiões não mapeadas do piso industrial, garantindo a descoberta de caminhos válidos mesmo em ambientes complexos e de alta dimensão.

## 2. Conceituação Teórica do Espaço de Configuração

O planejamento do AGV via RRT opera sobre o **Espaço de Configuração** ($\mathcal{C}$):

* **$\mathcal{C}_{\text{free}}$ (Espaço Livre):** Subconjunto do piso da fábrica onde o AGV pode navegar sem colidir com estruturas fixas ou obstáculos dinâmicos.

* **$\mathcal{C}_{\text{obs}}$ (Espaço de Obstáculos):** Regiões ocupadas por estantes, máquinas, pilares e zonas de restrição (*keep-out zones*).

* **Estado Inicial ($q_{\text{start}}$):** Coordenada atual $(x, y, \theta)$ reportada pelos odômetros e LiDAR do AGV.

* **Estado Objetivo ($q_{\text{goal}}$):** Ponto de destino da missão (ex: Ponto de Transferência / Doca).

## 3. Funcionamento Algorítmico do RRT

O RRT expande uma árvore $T = (V, E)$ enraizada no estado inicial $q_{\text{start}}$ em direção a pontos amostrados aleatoriamente no espaço.

```
       [q_rand] (Amostra Aleatória)
          .
          .  (Vetor de Direção)
          .
       [q_near] ─── (passo η) ───> [q_new] (Novo Nó Adicionado)
          │
      [q_start]
```

### Algoritmo de Expansão Passo a Passo:

1. **Amostragem Aleatória ($\text{Sample}$):** Sorteia-se um ponto aleatório $q_{\text{rand}} \in \mathcal{C}$. Para acelerar a convergência, aplica-se uma probabilidade de viés ($p_{\text{bias}}$) apontando diretamente para $q_{\text{goal}}$.

2. **Busca do Vizinho Mais Próximo ($\text{Nearest}$):** Encontra-se o nó $q_{\text{near}} \in V$ que possui a menor distância euclidiana até $q_{\text{rand}}$:
   

   $$
   q_{\text{near}} = \arg\min_{v \in V} \| v - q_{\text{rand}} \|
   $$

3. **Passo de Extensão ($\text{Steer}$):** Avança-se uma distância fixa $\eta$ de $q_{\text{near}}$ na direção de $q_{\text{rand}}$, gerando o nó candidato $q_{\text{new}}$:
   

   $$
   q_{\text{new}} = q_{\text{near}} + \eta \cdot \frac{q_{\text{rand}} - q_{\text{near}}}{\| q_{\text{rand}} - q_{\text{near}} \|}
   $$

4. **Checagem de Colisão ($\text{CollisionFree}$):** Verifica-se se o segmento de reta $\overline{q_{\text{near}} q_{\text{new}}}$ intercepta algum obstáculo em $\mathcal{C}_{\text{obs}}$.

5. **Adição à Árvore:** Se o segmento for livre de colisões, adiciona-se $q_{\text{new}}$ a $V$ e a aresta $(q_{\text{near}}, q_{\text{new}})$ a $E$.

6. **Critério de Parada:** O algoritmo encerra quando a distância $\| q_{\text{new}} - q_{\text{goal}} \| < \epsilon$, reconstruindo a trajetória da folha até a raiz $q_{\text{start}}$.

## 4. RRT vs. Outros Algoritmos de Roteamento

| Característica | Dijkstra / A* | RRT (Rapidly-exploring Random Trees) | Impacto no AGV |
| ----- | ----- | ----- | ----- |
| **Domínio** | Grafo Discreto / Grids | Espaço Contínuo 2D/3D | RRT contorna obstáculos em qualquer ângulo, sem ficar preso aos eixos do grid. |
| **Completo** | Completo | Probabilisticamente Completo | Encontra uma rota válida conforme o tempo de amostragem tende ao infinito. |
| **Tempo de Execução** | Depende do tamanho da grade | Rápido ($O(N \log N)$ com KD-Tree) | Excelente para desvio dinâmico de obstáculos em sub-segundos. |
| **Suporte Kinodinâmico** | Difícil aplicação | Nativo | Permite incorporar restrições de esterçamento e aceleração do veículo. |

## 5. Aplicação no Ecossistema Visão-AGV

No sistema autônomo do **Visão-AGV**, o RRT atua como o **Planejador Local de Trajetória (Local Planner)**:

1. **Desvio Reativo:** Se o sensor LiDAR identifica um obstáculo imprevisível a 2 metros, o RRT é disparado para traçar uma curva de desvio contornando a obstrução sem precisar recomputar todo o grafo global da fábrica.

2. **Navegação em Corredores Estreitos:** A amostragem aleatória com viés no objetivo permite ao AGV encontrar brechas entre paletes e máquinas.

3. **Suavização de Rota:** O caminho bruto em árvore gerado pelo RRT passa por um pós-processamento de *shortcutting* (suavização) para remover vértices desnecessários antes de enviar as referências de velocidade ($\nu, \omega$) para os motores.