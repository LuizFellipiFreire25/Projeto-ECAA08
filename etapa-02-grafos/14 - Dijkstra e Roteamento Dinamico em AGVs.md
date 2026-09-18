# Aula 14: Menor Caminho — Algoritmo de Dijkstra e Roteamento Dinâmico do AGV Logístico

## 1. Fundamentos Matemáticos: Algoritmo Guloso de Dijkstra para AGVs

No contexto do *SCADA-Core / Visão-AGV*, a navegação autônoma em malhas complexas exige a determinação do trajeto de custo mínimo em tempo real. Dado um dígrafo ponderado com custos não-negativos:

$$G = (V, E, W)$$

Onde:
* $V$ é o conjunto de estações (waypoints e pontos de checagem RFID/LiDAR).
* $E$ representa os corredores de tráfego do galpão.
* $W: E \to \mathbb{R}^+$ associa a cada corredor um custo físico $W(e) \ge 0$ (comprimento em metros $L$ ou tempo de travessia estipulado em segundos).

O *Algoritmo de Dijkstra* utiliza uma estratégia gulosa (greedy) baseada em uma Fila de Prioridades (Min-Heap). Ele calcula a rota otimizada de um vértice fonte $s \in V$ até os demais vértices $v \in V$ com complexidade computacional:

$$\mathcal{O}((\vert{}V\vert{} + \vert{}E\vert{}) \log \vert{}V\vert{})$$

### Vantagem no Roteamento Dinâmico
Diferente da Busca em Largura (BFS), que considera apenas o número de conexões (hops), o Algoritmo de Dijkstra pondera distâncias físicas reais e permite o *recálculo dinâmico de pesos*, adaptando as rotas do AGV em caso de congestionamentos, restrições de velocidade ou desvios de segurança.

---

## 2. Diagrama da Malha Ponderada (Mermaid)

```mermaid
graph LR
    ST01["ST-01: Estação Base"] -->|10m - Corredor 1| DOC101["DOC-101: Doca Recebimento"]
    ST01 -->|12m - Corredor 2| ALM201["ALM-201: Almoxarifado"]
    DOC101 -->|15m - Corredor 3| ALM201
    ALM201 -->|20m - Corredor 4| AMO301["AMO-301: Posto Amostragem"]
    AMO301 -->|18m - Corredor 5| R101["R-101: Reator Químico"]
    AMO301 -->|14m - Corredor 6| DEP401["DEP-401: Depósito Final"]
    R101 -->|25m - Corredor 7| DEP401
    DEP401 -->|30m - Corredor 8| ST01