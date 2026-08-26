# Aula 10: Avaliação Integrada do Módulo 1 — Motor de Intertravamento e Diagnóstico do AGV

## 1. Escopo e Diretrizes do Desafio de Engenharia Mecatrônica

Nesta avaliação integradora, os estudantes consolidam os conceitos do **Módulo 1: Lógica Formal & Sistemas Especialistas**, demonstrando o funcionamento conjunto de todos os subsistemas embarcados no robô autônomo:

1. **Mapeamento de Telemetria e Tags Mecatrônicas:** Normalização de sinais analógicos e digitais (LiDAR, Encoders, BMS Lítio, IMU e Watchdog Wi-Fi via Barramento CAN/Digital IO) para proposições booleanas de segurança.
2. **Motor de Intertravamento Lógico e Prova Formal:** Verificação exaustiva por tabela-verdade ($2^n$ estados) e prova por refutação para garantir intertravamentos SIL 3 (E-Stop, corte de PWM do motor e travamento elétrico de freio).
3. **Motor de Inferência Híbrido (*Forward/Backward Chaining*):** Diagnóstico automático de causa-raiz, resolução de conflitos por prioridade e emissão de comandos de emergência no SCADA-Core do AGV.

---

## 2. Visão Geral da Integração do Sistema SCADA-Core

```mermaid
graph TD
    subgraph "Sinais de Campo & Sensores do AGV"
        CAN["Barramento CAN / IOs (LiDAR, Encoders, BMS)"] --> SIG["Normalizador de Sinais Mecatrônicos"]
        SIG --> FATOS["Base de Fatos Dinâmicos F(t)"]
    end

    subgraph "Núcleo de Raciocínio Lógico (Módulo 1)"
        FATOS --> VERIF["Verificador Dedutivo Formal (2^n Tautologias)"]
        FATOS --> ENGINE["Motor de Inferência Híbrido (Forward & Backward)"]
        REGRAS["Base de Conhecimento R (Regras R-01 a R-06)"] --> ENGINE
    end

    subgraph "Atuação de Segurança & Telemetria"
        VERIF -->|Validado| INTER["Intertravamento Mecânico / Eletrônico (Ponte H, Freio)"]
        ENGINE -->|Diagnóstico| LOG["Trilha de Auditoria & SCADA HMI"]
    end