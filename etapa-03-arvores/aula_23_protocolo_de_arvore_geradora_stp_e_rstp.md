# Aula 23: Protocolo de Árvore Geradora (STP / RSTP) na Infraestrutura Industrial do Visão-AGV

## 1. Introdução e Contextualização no Projeto Visão-AGV

No ambiente industrial moderno do **Visão-AGV / SCADA-Core**, a comunicação sem fio e com fio entre o servidor supervisor e os pontos de acesso (Wi-Fi 6 / 5G Privado) espalhados pelo piso da fábrica precisa ser extremamente confiável. Para evitar falhas críticas de navegação causadas pelo rompimento de cabos de rede ou pela inoperância de um switch, a infraestrutura física de rede adota uma topologia em anel ou em malha redundante.

No entanto, a existência de caminhos redundantes (loops físicos) em redes Ethernet chaveadas introduz um problema severo: as **tempestades de broadcast** (*broadcast storms*). Se pacotes de telemetria ou comandos de parada de emergência do AGV forem multiplicados em loop, a largura de banda da fábrica é consumida em milissegundos, travando todo o sistema de controle.

O **Spanning Tree Protocol (STP - IEEE 802.1D)** e sua evolução, o **Rapid Spanning Tree Protocol (RSTP - IEEE 802.1w)**, são protocolos de camada de enlace de dados (Camada 2 do Modelo OSI) que resolvem esse dilema. Eles detectam loops em grafos de rede físicos e bloqueiam portas estrategicamente, transformando uma topologia em malha com ciclos em uma **Árvore Geradora Sem Ciclos (Spanning Tree)** lógica.

---

## 2. O Problema das Tempestades de Broadcast na Operação de AGVs

Considere uma malha industrial composta por 4 switches gerenciáveis ($S_1, S_2, S_3, S_4$) interligando as estações base de recarga e o servidor SCADA:

```
    [Servidor SCADA Central]
               |
            ( Switch 1 - Root Bridge )
             /                      \
   ( Switch 2 - Doca ) ===== ( Switch 3 - Almoxarifado )
             \                      /
           ( Switch 4 - Área de Recarga )
```

Sem um protocolo de prevenção de loops:
1. O AGV envia um pacote de telemetria ARP ou Broadcast pedindo sincronização com o SCADA.
2. Os switches retransmitem o pacote por todas as portas ativas.
3. Os pacotes circulam indefinidamente no loop $S_2 \to S_3 \to S_4 \to S_2$, duplicando exponencialmente as mensagens.
4. O buffer de memória dos switches se esgota, causando *frame-dropping* e perda de comunicação com o robô móvel autônomo, ativando os relés de parada de emergência.

---

## 3. Funcionamento Matemático do STP / RSTP

O algoritmo por trás do STP baseia-se no cálculo da **Árvore Geradora Mínima (MST)** com pesos atribuídos às velocidades dos links físicos (ex: 1 Gbps, 10 Gbps).

### Etapas da Eleição e Topologia da Árvore:

1. **Eleição do Root Bridge (Ponte Raiz):**
   * O switch com o menor **Bridge ID (BID)** é eleito como a raiz da árvore de comunicação.
   * $\text{BID} = \text{Prioridade (2-byte)} + \text{Endereço MAC (6-byte)}$.

2. **Determinação dos Root Ports (RP):**
   * Em cada switch não-raiz, a porta de menor custo até o *Root Bridge* é configurada no estado de **Encaminhamento (Forwarding)**.
   * O custo do caminho $C$ é a soma dos pesos das arestas físicas:
     $$C = \sum_{i \in \text{caminho}} W(e_i)$$

3. **Determinação dos Designated Ports (DP):**
   * Em cada segmento de rede, a porta responsável por encaminhar tráfego em direção à raiz é definida como *Designated Port* (Forwarding).

4. **Bloqueio de Loops (Alternate / Backup Ports):**
   * Todas as portas restantes que fechariam um ciclo lógico são colocadas no estado de **Bloqueio (Blocking / Discarding)**.

---

## 4. Comparativo Tecnológico: STP vs. RSTP na Intralogística

Para manter a navegação autônoma do AGV segura, o tempo de reconvergência da rede em caso de falha de link é um fator determinante:

| Característica | STP (IEEE 802.1D) | RSTP (IEEE 802.1w) | Impacto na Operação do AGV |
| :--- | :--- | :--- | :--- |
| **Tempo de Convergência** | 30 a 50 segundos | $< 1$ a 6 segundos | O RSTP evita paradas prolongadas de emergência por timeout de heartbeat. |
| **Estados das Portas** | Blocking, Listening, Learning, Forwarding, Disabled | Discarding, Learning, Forwarding | O RSTP simplifica os estados operacionais da interface do switch. |
| **Papéis de Porta** | Root Port, Designated Port, Non-Designated | Root Port, Designated Port, Alternate Port, Backup Port | Permite failover imediato para a porta alternativa (*Alternate Port*). |
| **Mecanismo de Proposta/Acordo** | Baseado em temporizadores (*Timers*) | Troca ativa de mensagens BPDU (*Handshake*) | O RSTP não precisa esperar 15s em cada estado intermediário para reconfigurar a malha. |

---

## 5. Aplicação no Ecossistema Visão-AGV

No projeto do **Visão-AGV**, a modelagem e simulação do algoritmo RSTP traz as seguintes vantagens práticas:

1. **Redundância Zero-Downtime:** Se a fibra óptica do corredor de docas for danificada pelo tráfego de empilhadeiras, a *Alternate Port* assume em menos de 1 segundo, mantendo o stream de dados do LiDAR ativo sem perda de conexão.
2. **Determinismo na Comunicação L2:** O protocolo força a rede física em malha a comportar-se logicamente como uma árvore binária/n-ária acíclica, eliminando duplicações e desordem de pacotes de dados.
3. **Integração com o SCADA-Core:** O supervisor monitora a estrutura da árvore geradora. Caso o *Root Bridge* primário falhe, o sistema dispara alertas de manutenção preventivos informando o rearranjo da topologia da rede.