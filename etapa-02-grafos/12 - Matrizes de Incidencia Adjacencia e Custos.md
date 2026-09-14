# Aula 12: Matrizes de Incidência, Adjacência e Balanço de Tráfego de AGVs

## 1. Fundamentos Matemáticos: A Matriz de Incidência Vértice-Aresta ($B$) para Navegação

Seja um dígrafo $G = (V, E)$ representando a malha logística do galpão, com $|V| = n$ estações (vértices) e $|E| = m$ corredores dirigidos (arestas). A **Matriz de Incidência** $B \in \{-1, 0, 1\}^{n \times m}$ é definida por:

$$B[i, j] = \begin{cases} -1, & \text{se a rota } e_j \text{ sai da estação } v_i \text{ (origem)} \\ +1, & \text{se a rota } e_j \text{ entra na estação } v_i \text{ (destino)} \\ 0, & \text{se a estação } v_i \text{ não incide na rota } e_j \end{cases}$$

### Propriedades Formais na Logística Autônoma:
1. **Soma por Coluna Nula:** Para todo corredor $j$, $\sum_{i=1}^n B[i, j] = 0$. (Fisicamente, significa que um AGV que sai de uma origem deve obrigatoriamente chegar ao destino daquela rota).
2. **Balanço de Fluxo de Veículos (Conservação):** $B \cdot \vec{Q} = \vec{S}$.
   * $\vec{Q}$: Vetor de fluxo de AGVs nos corredores (ex: veículos/hora).
   * $\vec{S}$: Vetor de acúmulo/liberação. (0 para estações de passagem, valores positivos para gargalos onde AGVs se acumulam, ou negativos para estações base que liberam veículos).

---

## 2. Entregável da Aula 12

* **Motor Matricial de Tráfego do AGV:** Geração automatizada da Matriz de Incidência $B \in \mathbb{R}^{n \times m}$ a partir da malha de navegação cadastrada e validação da equação de conservação de veículos $B \cdot \vec{Q} = \vec{S}$ para identificar gargalos operacionais no galpão
