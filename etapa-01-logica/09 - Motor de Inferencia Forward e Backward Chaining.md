# Aula 09: Motores de Inferência — Encadeamento para Frente e para Trás no AGV

## 1. Fundamentos Matemáticos: Algoritmos de Inferência em Lógica de Produção

Um **Motor de Inferência (Inference Engine)** no SCADA-Core do AGV é o algoritmo formal responsável por aplicar as regras de produção da base de conhecimento ($\mathcal{R}$) sobre os fatos ativos da telemetria ($\mathcal{F}$) para produzir novas ações de controle ou diagnosticar causas-raiz de falhas mecatrônicas.

### 1.1. Encadeamento para Frente (*Forward Chaining* — Data-Driven / Reativo)
* **Princípio:** Inicia com os **fatos conhecidos de telemetria em tempo real** ($\mathcal{F}(t)$ — ex: leituras de encoders, LiDAR, BMS) e dispara todas as regras cujos antecedentes são verdadeiros (*Modus Ponens* sucessivo), adicionando os consequentes inferidos à base de fatos até alcançar um ponto fixo (*Fixed Point*).
* **Aplicação no AGV:** Monitoramento contínuo de segurança e intertravamentos reativos instantâneos (ex: sensor detecta invasão $\rightarrow$ infere risco de colisão $\rightarrow$ aciona freio e desliga motores).

### 1.2. Encadeamento para Trás (*Backward Chaining* — Goal-Driven / Diagnóstico)
* **Princípio:** Inicia com uma **hipótese ou meta de diagnóstico** $H$ (ex: *"O AGV sofreu parada de emergência por Fuga Térmica na Bateria?"*) e busca regressivamente nas regras de $\mathcal{R}$ quais antecedentes deveriam ser verdadeiros para satisfazer $H$, reduzindo hipóteses complexas a sub-metas até chegar aos fatos de campo gravados na telemetria.
* **Aplicação no AGV:** Análise pós-incidente, auditoria de falhas e diagnósticos orientados a perguntas no SCADA do centro de controle.

```mermaid
graph TD
    subgraph "Encadeamento para Frente (Data-Driven: Telemetria -> Ação)"
        F1["Fatos da Telemetria (LiDAR, BMS)"] -->|Pattern Matching| R1["Disparo de Regras de Campo"]
        R1 -->|Inferência| F2["Novos Fatos / Alarmes"]
        F2 -->|Ponto Fixo| ACT["Atuação de Emergência (E-Stop / Freio)"]
    end

    subgraph "Encadeamento para Trás (Goal-Driven: Meta -> Causa-Raiz)"
        GOAL["Meta/Hipótese: TRIP_ISOLAMENTO_TOTAL?"] -->|Busca Regressiva| R2["Regras que geram a Meta"]
        R2 -->|Sub-metas| SUB["Verificar Antecedentes (RISCO_COLISAO, WIFI_FAIL)"]
        SUB -->|Checagem em F(t)| COMP["Confirmação ou Refutação da Hipótese"]
    end
