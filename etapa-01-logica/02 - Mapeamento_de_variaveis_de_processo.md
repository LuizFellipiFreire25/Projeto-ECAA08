# Mapeamento de Variáveis de Processo para Proposições Lógicas

Na automação industrial (norma **ISA-5.1**), instrumentos, sensores e algoritmos de controle emitem e recebem sinais discretos (binários: $0$ = Falso / $1$ = Verdadeiro).

Abaixo, as variáveis da planta para o **AGV Logístico de Inspeção (Adaptação Drone Follow-Me) - Setor 300** são discretizadas em proposições lógicas para alimentação do motor de intertravamento e supervisão do SCADA-Core.

## Setor 300: AGV Logístico e Visão Computacional (Follow-Me)

### 1. Entradas de Visão Computacional (Processamento de Imagem - Python/IA)

| Tag Instrumento | Tipo de Dispositivo | Variável Virtual | Proposição Lógica | Estado 1 (Verdadeiro) |
| :--- | :--- | :--- | :--- | :--- |
| **CAM-101** | Algoritmo IA (MobileNet V2) | Presença do Alvo | $c_1$ | Alvo detectado com confiança $> 0.5$ |
| **CAM-102** | Algoritmo de Geometria | Área da *Bounding Box* | $d_{perto}$ | Área atual $> 	ext{Area}_{ref} 	imes 1.15$ (Muito perto) |
| **CAM-102** | Algoritmo de Geometria | Área da *Bounding Box* | $d_{longe}$ | Área atual $< 	ext{Area}_{ref} 	imes 0.85$ (Muito longe) |
| **CAM-103** | Algoritmo de Posição | Erro de Centro (X) | $x_{esq}$ | Erro de posição $< -30$ px (Fora da zona morta à esquerda) |
| **CAM-103** | Algoritmo de Posição | Erro de Centro (X) | $x_{dir}$ | Erro de posição $> 30$ px (Fora da zona morta à direita) |

### 2. Entradas de Segurança e Estado de Bordo (Sensores de Hardware - Arduino)

| Tag Instrumento | Tipo de Dispositivo | Variável Física | Proposição Lógica | Estado 1 (Verdadeiro) |
| :--- | :--- | :--- | :--- | :--- |
| **AT-201** | Detector de Gás Tóxico | Concentração $	ext{NH}_3$ | $g_1$ | Vazamento de amônia detectado na rota ($C > 25	ext{ ppm}$) |
| **BT-201** | Transmissor de Tensão | Nível da Bateria | $b_1$ | Tensão em nível crítico de descarga ($V < 10\%$) |
| **ESD-200** | Botão Físico (Cogumelo) | Parada de Emergência | $s_1$ | Parada de emergência acionada pelo operador (NF aberto) |

### 3. Atuadores e Sinalização de Saída (Saídas do CLP/Arduino)

| Tag Instrumento | Tipo de Dispositivo | Variável Física | Proposição Lógica | Estado 1 (Verdadeiro) |
| :--- | :--- | :--- | :--- | :--- |
| **M-301A** | Motor DC de Tração | Tração das Rodas | $m_{avanca}$ | Motor LIGADO no sentido APROXIMAR (Sinal Serial `A`) |
| **M-301R** | Motor DC de Tração | Tração das Rodas | $m_{recua}$ | Motor LIGADO no sentido AFASTAR (Sinal Serial `F`) |
| **SV-301E** | Servo Motor | Ângulo de Esterçamento | $sv_{esq}$ | Direção ajustada para ESQUERDA (Ângulo calculado $> 90^\circ$) |
| **SV-301D** | Servo Motor | Ângulo de Esterçamento | $sv_{dir}$ | Direção ajustada para DIREITA (Ângulo calculado $< 90^\circ$) |
| **A-301** | Atuador Linear / Pistão | Braço de Amostragem | $a_1$ | Braço robótico ESTENDIDO em operação de coleta |
| **ALM-301** | Sinalizador Sonoro/Visual | Alarme de Segurança | $l_1$ | Giroflex e sirene de emergência ATIVADOS |

---

## Tabela Resumo de Proposições e Estados do SCADA

* **Entradas de Processo ($E$):** $E \in \{c_1, d_{perto}, d_{longe}, x_{esq}, x_{dir}, g_1, b_1, s_1\}$
* **Saídas do Sistema ($S$):** $S \in \{m_{avanca}, m_{recua}, sv_{esq}, sv_{dir}, a_1, l_1\}$
* **Convenção Lógica:**
  * Sinais de desvio e falha ($d_{perto}, d_{longe}, x_{esq}, x_{dir}, g_1, b_1, s_1, l_1$): Ativos em nível alto ($1$ = Condição Ativa).
  * Sinais de permissão e operação ($c_1, m_{avanca}, m_{recua}, sv_{esq}, sv_{dir}, a_1$): Ativos em nível alto ($1$ = Operativo / Executando).
