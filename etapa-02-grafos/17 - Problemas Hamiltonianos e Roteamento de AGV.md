# Aula 17: Problemas Hamiltonianos e Roteamento Logístico de AGVs (TSP)

## 1. Fundamentos Matemáticos: Ciclos Hamiltonianos e o Caixeiro-Viajante (TSP)

No sistema **SCADA-Core / Visão-AGV**, existem cenários em que o veículo autônomo atua como um coletor ou distribuidor de peças, necessitando visitar diversas estações de trabalho espalhadas pelo galpão para abastecimento ou recolhimento. 

Ao contrário da inspeção de infraestrutura (Euleriano, que foca nas arestas/corredores), o objetivo aqui é visitar **todos os vértices (estações)** exatamente uma única vez e retornar à base, minimizando o custo total (distância ou tempo). Este é um **Ciclo Hamiltoniano**, e sua otimização é conhecida como o **Problema do Caixeiro-Viajante (TSP - Traveling Salesperson Problem)**.

Como o TSP é um problema *NP-Difícil*, calcular todas as permutações possíveis (fatorial de $N$) é inviável em tempo real. Portanto, a indústria utiliza uma abordagem em duas etapas:
1. **Heurística Construtiva (Nearest Neighbor / Vizinho Mais Próximo):** O AGV sempre escolhe a estação não visitada mais próxima. Gera uma rota rápida, mas subótima.
2. **Refinamento de Busca Local (2-Opt):** Algoritmo que desfaz cruzamentos na rota gerada, invertendo segmentos do trajeto para encontrar um custo total menor, aproximando-se da solução ótima.

---

## 2. Diagrama de Otimização de Rota (Mermaid)

Ilustração de um cruzamento ineficiente (comum no Nearest Neighbor) sendo corrigido pela troca de arestas (2-Opt) para reduzir a distância total.

```mermaid
graph TD
    subgraph "Antes do 2-Opt (Com Cruzamento)"
        A1[ST-01: Base] --> B1[DOC-101]
        B1 --> C1[ALM-201]
        C1 --> D1[AMO-301]
        D1 --> A1
    end

    subgraph "Depois do 2-Opt (Otimizado)"
        A2[ST-01: Base] --> C2[ALM-201]
        C2 --> B2[DOC-101]
        B2 --> D2[AMO-301]
        D2 --> A2
    end
