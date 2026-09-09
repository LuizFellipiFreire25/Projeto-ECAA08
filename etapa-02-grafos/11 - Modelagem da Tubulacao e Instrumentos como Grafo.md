# Aula 11: Teoria dos Grafos — Modelagem da Malha de Navegação do AGV Logístico

## 1. Fundamentos Matemáticos: Definição Formal do Dígrafo de Navegação

No projeto SCADA-Core / Visão-AGV, a malha de movimentação autônoma do AGV no ambiente fabril é modelada como um Grafo Dirigido e Ponderado (Dígrafo):

$$G = (V, E, W)$$

Onde:
* $V = \{v_1, v_2, \dots, v_n\}$ é o conjunto finito de vértices (estações de carga, docas, postos de amostragem de reagentes e pontos de controle RFID/LiDAR).
* $E \subseteq V \times V$ é o conjunto de arestas dirigidas (corredores unidirecionais de tráfego do AGV).
* $W: E \to \mathbb{R}^+$ é a função de ponderação, que associa a cada rota um custo operacional (distância $L$ [m] ou tempo estimado de travessia).

### Diagrama da Malha de Navegação do AGV (Mermaid)


graph LR
    ST01["ST-01: Estação Base / Carga"] -->|10m - TAG-01| DOC101["DOC-101: Doca Recebimento"]
    ST01 -->|12m - TAG-02| ALM201["ALM-201: Almoxarifado"]
    DOC101 -->|15m - TAG-03| ALM201
    ALM201 -->|20m - TAG-04| AMO301["AMO-301: Posto Amostragem"]
    AMO301 -->|18m - TAG-05| R101["R-101: Reator Químico"]
    AMO301 -->|14m - TAG-06| DEP401["DEP-401: Depósito Final"]
    R101 -->|25m - TAG-07| DEP401
    DEP401 -->|30m - TAG-08| ST01