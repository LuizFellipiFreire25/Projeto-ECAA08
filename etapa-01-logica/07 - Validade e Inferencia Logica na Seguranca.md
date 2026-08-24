# Aula 07: Validade de Argumentos e Inferência Lógica na Segurança do AGV

## 1. Fundamentos Matemáticos: Argumentos Dedutivos, Validade e Tautologias

Na engenharia de sistemas autônomos e segurança de robôs móveis (*Safety Instrumented Systems - SIS* / ISO 13849 e IEC 61508), a tomada de decisão crítica para o desarmamento imediato da tração do AGV (*Emergency Shutdown - ESD*) deve ser fundamentada na **Validade Lógica Dedutiva**.

### 1.1. Definição Formal de Argumento e Validade

Um **argumento dedutivo** no controlador do AGV é uma estrutura formal composta por um conjunto finito de premissas de campo $\{P_1, P_2, \dots, P_k\}$ e uma conclusão de atuação $C$ (ex: parar motor $M_{301}$), denotado formalmente por:

$$P_1, P_2, \dots, P_k \vdash C$$

Diz-se que o argumento é **semanticamente válido** (denotado por $P_1, P_2, \dots, P_k \models C$) se e somente se for **impossível** que todas as premissas de telemetria sejam verdadeiras e a conclusão de segurança seja simultaneamente falsa.

Pela equivalência fundamental do Teorema da Dedução:

$$\{P_1, P_2, \dots, P_k\} \models C \quad \iff \quad (P_1 \land P_2 \land \dots \land P_k) \rightarrow C \equiv \mathbf{T} \quad (\text{Tautologia})$$

```mermaid
graph TD
    subgraph "Processo de Prova Dedutiva Formal do AGV"
        P1["Premissa 1: d1 (Detecção de Obstáculo Proximo)"] --> CONJ["Conjunção das Premissas: (P1 ∧ P2 ∧ P3)"]
        P2["Premissa 2: g1 (Vazamento de Gás NH3)"] --> CONJ
        P3["Premissa 3: (d1 ∨ g1) → Trip_M301 (Regra de Segurança)"] --> CONJ
        CONJ --> IMPL["Implicação: (P1 ∧ P2 ∧ P3) → Trip_M301"]
        IMPL --> EVAL{"Avaliação Semântica em todos os 2^n estados"}
        EVAL -->|Sempre Verdadeiro| VAL["Argumento VÁLIDO (Teorema de Segurança Comprovado)"]
        EVAL -->|Existe contraexemplo| INV["Argumento INVÁLIDO (Risco de Colisão / Explosão)"]
    end