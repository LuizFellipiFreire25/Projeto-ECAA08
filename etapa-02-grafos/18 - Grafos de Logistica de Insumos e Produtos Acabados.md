# Aula 18: Redes Multicamada e Grafos Logísticos de Insumos e Produtos

## 1. Fundamentos Matemáticos: DAGs e Redes Multicamada no SCADA

No ecossistema **SCADA-Core / Visão-AGV**, precisamos mapear não apenas por onde o veículo autônomo anda, mas também o que ele está transportando. Para evitar falhas críticas de modelagem — como o motor de rotas tentar trafegar um AGV por dentro de uma tubulação ou inverter a ordem de fabricação de um produto — a indústria utiliza a modelagem de **Redes Multicamada** (*Multilayer Networks*).

Formalmente, representamos a fábrica como múltiplos grafos sobrepostos $\mathcal{M}$:
1. **$G_M$ (Grafo de Materiais):** Modela o processo produtivo e o fluxo de transformação. É estritamente um **Grafo Acíclico Dirigido (DAG)**, pois as etapas físico-químicas (dosagem $\to$ granulação $\to$ ensaque) são irreversíveis. Admite **Ordenação Topológica** (via Algoritmo de Kahn) para auditar a coerência da produção.
2. **$G_V$ (Grafo de Veículos/AGV):** Modela a infraestrutura física (corredores, docas). Contém ciclos (o AGV pode dar a volta no galpão) e trechos bidirecionais. É onde aplicamos o **Algoritmo de Dijkstra** para roteamento de tráfego físico.

Separar as camadas garante que o algoritmo certo responda à pergunta certa. Vértices com o mesmo nome (ex: "Docas") representam o mesmo espaço físico, mas possuem conexões lógicas completamente diferentes em $G_M$ e $G_V$.

---

## 2. Diagrama de Redes Multicamada (Mermaid)

O diagrama abaixo ilustra a diferença de topologia no mesmo setor do galpão. O fluxo de material é sequencial (DAG), enquanto a malha do AGV permite retornos.

```mermaid
graph TD
    subgraph "G_M : Fluxo de Materiais (DAG - Sem Ciclos)"
        M_REC[Recebimento Insumos] --> M_DOS[Silos de Dosagem]
        M_DOS --> M_GRAN[Granulação]
        M_GRAN --> M_ENS[Ensacamento / Estoque]
    end

    subgraph "G_V : Circulação de AGVs (Com Ciclos)"
        V_DOCA[Doca de Carga] <--> V_COR1[Corredor A]
        V_COR1 <--> V_EST[Área de Estoque]
        V_EST <--> V_COR2[Corredor B]
        V_COR2 <--> V_DOCA
    end