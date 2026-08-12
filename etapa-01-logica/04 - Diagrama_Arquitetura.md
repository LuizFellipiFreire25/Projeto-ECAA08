# Diagrama de Arquitetura Lógica e Intertravamento

Este documento apresenta o diagrama estrutural do sistema de controle do AGV. O fluxo mapeia a transição dos sinais discretos capturados pela **Visão Computacional (IA)** e pelos **Sensores de Bordo (Hardware)** até chegarem ao **Motor Lógico do SCADA-Core**, que processa as equações booleanas e aciona os **Atuadores**.

O diagrama abaixo foi gerado utilizando a linguagem de modelagem de grafos *Mermaid*.

```mermaid
graph TD
    %% Entradas de Dados
    subgraph Visao [Visão Computacional - Câmera Frontal]
        C1(c1: Operador Detectado)
        D1(d1: Operador Muito Perto)
    end

    subgraph Seguranca [Sensores de Bordo - Hardware]
        S1(s1: E-Stop Pressionado)
        B1(b1: Bateria Crítica)
        G1(g1: Gás Tóxico)
    end

    %% Processamento Lógico (SCADA)
    subgraph Logica [Motor Lógico SCADA-Core]
        OR_F{PORTA OR<br/>Falha Crítica F}
        AND_P{PORTA AND<br/>Permissivo P_mov}
        NOT_F((NOT))
    end

    %% Saídas Físicas
    subgraph Saidas [Atuadores e Sinalização]
        M1[m1: Motor de Tração]
        A1[a1: Braço Robótico]
        L1[l1: Alarme / Giroflex]
    end

    %% Roteamento da Falha Crítica
    S1 --> OR_F
    B1 --> OR_F
    G1 --> OR_F
    
    %% Consequências da Falha
    OR_F ==>|F = 1| L1
    OR_F --> NOT_F
    
    %% Roteamento do Permissivo de Movimento
    C1 --> AND_P
    D1 -.->|Sinal Invertido ¬d1| AND_P
    NOT_F -->|Sinal ¬F| AND_P
    
    %% Atuação
    AND_P ==>|P_mov = 1| M1
    
    %% Proteção Mecânica
    M1 -.->|Intertrava: Bloqueia se m1=1| A1
    
    %% Estilos de cores (opcional, o GitHub renderiza perfeitamente sem, mas adiciona destaque)
    classDef red fill:#ffcccc,stroke:#cc0000,stroke-width:2px;
    classDef green fill:#ccffcc,stroke:#009900,stroke-width:2px;
    classDef logic fill:#e6f2ff,stroke:#0066cc,stroke-width:2px;
    
    class S1,B1,G1,OR_F,L1 red;
    class C1,M1 green;
    class AND_P,NOT_F logic;