

# Mapeamento de Variáveis de Processo para Proposições Lógicas

Na automação industrial (norma **ISA-5.1**), instrumentos, sensores e algoritmos de controle emitem e recebem sinais discretos (binários: $0$ = Falso / $1$ = Verdadeiro).

Abaixo, as variáveis do **AGV Logístico de Inspeção e Amostragem (Setor 300)** são discretizadas em proposições lógicas para alimentação do motor de intertravamento e supervisão do SCADA-Core.

---

## Setor 300: AGV Logístico e Visão Computacional (Follow-Me)

![Diagrama do AGV Logístico](diagrama_agv.png)


### 1. Entradas de Visão Computacional (Processamento de Imagem - IA)

| Tag Instrumento | Tipo de Dispositivo | Variável Física / Virtual | Proposição Lógica | Estado 1 (Verdadeiro) |
| :--- | :--- | :--- | :--- | :--- |
| **CAM-101** | Algoritmo IA (MobileNet V2) | Presença do Operador | $c_1$ | Operador detectado com confiança $> 50\%$ |
| **CAM-102** | Algoritmo de Geometria | Área da *Bounding Box* | $d_1$ | Operador em zona de colisão (Área $>$ Limite Crítico) |

### 2. Entradas de Segurança e Estado de Bordo (Sensores de Hardware)

| Tag Instrumento | Tipo de Dispositivo | Variável Física | Proposição Lógica | Estado 1 (Verdadeiro) |
| :--- | :--- | :--- | :--- | :--- |
| **AT-201** | Detector de Gás Tóxico | Concentração de $\text{NH}_3$ | $g_1$ | Vazamento de amônia detectado na rota ($C > 25\text{ ppm}$) |
| **BT-201** | Transmissor de Tensão | Nível da Bateria | $b_1$ | Tensão em nível crítico de descarga ($V < 10\%$) |
| **ESD-200** | Botão Físico (Cogumelo) | Parada de Emergência | $s_1$ | Parada de emergência acionada pelo operador (NC) |

### 3. Atuadores e Sinalização de Saída (Saídas do CLP Embarcado)

| Tag Instrumento | Tipo de Dispositivo | Variável Física | Proposição Lógica | Estado 1 (Verdadeiro) |
| :--- | :--- | :--- | :--- | :--- |
| **M-301** | Motor DC de Tração | Tração das Rodas (PWM) | $m_1$ | Motor de tração LIGADO e avançando |
| **A-301** | Atuador Linear / Pistão | Braço de Amostragem | $a_1$ | Braço robótico ESTENDIDO em operação de coleta |
| **ALM-301** | Sinalizador Sonoro/Visual | Alarme de Segurança | $l_1$ | Giroflex e sirene de emergência ATIVADOS |

---

## Tabela Resumo de Proposições e Estados do SCADA

* **Entradas de Processo ($E$):** $E \in \{c_1, d_1, g_1, b_1, s_1\}$
* **Saídas do Sistema ($S$):** $S \in \{m_1, a_1, l_1\}$
* **Convenção Lógica:**
  * Sinais $c_1, m_1, a_1$: Ativos em nível alto ($1$ = Operativo / Normal).
  * Sinais $d_1, g_1, b_1, s_1, l_1$: Ativos em nível alto ($1$ = Condição de Falha / Risco).