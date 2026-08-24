# Aula 08: Sistemas Especialistas — Base de Conhecimento e Regras de Diagnóstico do AGV

## 1. Fundamentos Matemáticos: Arquitetura de Sistemas Baseados em Regras (RBS)

Na operação autônoma de robôs móveis industriais (AGVs), a ocorrência de anomalias simultâneas (obstáculos repentinos, falhas de tração, quedas de comunicação) exige diagnósticos automáticos ultra-rápidos baseados em *Sistemas Especialistas Baseados em Regras* (Rule-Based Expert Systems).

Formalmente, um Sistema Baseado em Regras embarcado no AGV é modelado pela tripla:

$$\langle \mathcal{F}, \mathcal{R}, \mathcal{E} \rangle$$

Onde:
1. *$\mathcal{F}$ (Base de Fatos):* Conjunto finito de proposições que representam o estado instantâneo do robô (sensores, odometria, status da bateria):
   $$\mathcal{F}(t) = \{f_1, f_2, \dots, f_m\} \subseteq \mathcal{U}_{\text{fatos}}$$
2. *$\mathcal{R}$ (Base de Conhecimento / Regras de Produção):* Conjunto de sentenças em *Cláusulas de Horn Definidas* da forma:
   $$R_i: \quad \text{SE } (A_{i,1} \land A_{i,2} \land \dots \land A_{i,k}) \quad \text{ENTÃO } \quad C_i$$
   Equivalentemente em lógica formal:
   $$\neg A_{i,1} \lor \neg A_{i,2} \lor \dots \lor \neg A_{i,k} \lor C_i$$
3. *$\mathcal{E}$ (Estratégia de Resolução e Conflito):* Critérios de arbitragem para seleção de regras ativadas simultaneamente (Prioridade de Segurança ISO 13849/SIL, Especificidade e Recência).

```mermaid
graph TD
    subgraph "Arquitetura do Sistema Especialista SCADA-Core do AGV"
        TLM["Telemetria do AGV (LiDAR, Encoders, BMS)"] --> MAP["Mapeador de Proposições"]
        MAP --> FATOS["Base de Fatos Dinâmica F(t)"]
        FATOS --> MATCHER["Motor de Casamento de Padrões (Pattern Matching)"]
        REGRAS["Base de Conhecimento R (Regras de Navegação e Segurança)"] --> MATCHER
        MATCHER --> AGENDA["Conjunto de Conflito / Agenda de Disparos"]
        AGENDA --> ARBITR["Arbitrador de Conflitos (Prioridade IEC 61508)"]
        ARBITR --> EXEC["Execução / Inferência de Ações de Controle (Freio, Desvio)"]
        EXEC --> DIAG["Relatório de Causa-Raiz e Registro em Log"]
    end