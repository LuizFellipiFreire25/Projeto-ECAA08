# Aula 15: Simulação de Obstrução de Corredor e Desvio Automático em Malha Fechada

## 1. Fundamentos Matemáticos: Reconfiguração Dinâmica de Grafos em Tempo Real

No sistema **SCADA-Core / Visão-AGV**, a segurança e a produtividade exigem reação imediata a obstruções no chão de fábrica (ex: pedestres em corredores, queda de carga ou falha mecânica de outros veículos).

Ao detectar uma interrupção em um corredor dirigido $e = (u, v)$, a malha de intertravamento de segurança atualiza a matriz de pesos em tempo real:

$$W(u, v) \leftarrow \infty$$

Em seguida, o motor de navegação aciona o algoritmo de Dijkstra recalculando a rota alternativa de contingência:

$$\vec{P}_{\text{novo}} = \text{Dijkstra}(G_{\text{reconfigurado}}, s, t)$$

### Latência Crítica de Resposta
O recálculo deve ocorrer em janela de tempo crítica (da ordem de milissegundos) para evitar a parada abrupta (*emergency stop*) do AGV, permitindo a transição suave para o caminho alternativo sem interromper o fluxo logístico.

---

## 2. Diagrama da Malha e Rota de Desvio (Mermaid)

```mermaid
graph LR
    ST01["ST-01: Estação Base"] -->|10m| DOC101["DOC-101: Doca Recebimento"]
    ST01 -->|12m| ALM201["ALM-201: Almoxarifado"]
    DOC101 -->|15m| ALM201
    ALM201 -->|20m| AMO301["AMO-301: Posto Amostragem"]
    AMO301 -.->|OBSTRUÇÃO: W = ∞| DEP401["DEP-401: Depósito Final"]
    AMO301 -->|18m - Desvio| R101["R-101: Reator Químico"]
    R101 -->|25m - Desvio| DEP401["DEP-401: Depósito Final"]
    DEP401 -->|30m| ST01
