# Aula 20: Compressão de Dados e Codificação de Huffman em Telemetria de AGVs

## 1. Contextualização no Projeto Visão-AGV

No ecossistema do **Visão-AGV / SCADA-Core**, os veículos móveis autônomos geram continuamente fluxos densos de telemetria (status dos atuadores, leituras de odometria, marcadores RFID lidos, estado da bateria e alertas de sensores). Em ambientes industriais com alta interferência eletromagnética ou largura de banda limitada em redes de rádio industrial (LoRa, Wi-Fi 6 ou redes privadas 5G), a eficiência no envio das mensagens é crítica para manter a latência de controle abaixo dos limites de segurança.

A **Codificação de Huffman** é um algoritmo guloso de compressão de dados sem perdas (*lossless*) baseado em árvores binárias. Ela atribui códigos de comprimento variável às mensagens de telemetria com base na frequência com que ocorrem no fluxo do AGV.

---

## 2. O Problema da Telemetria Industrial

Considere os pacotes de status reportados repetidamente pelo microcontrolador a bordo do AGV durante o percurso entre estações:

* **Eventos Frequentes:** `OK` (Regime Nominal), `MOV` (Veículo em Movimento).
* **Eventos Moderados:** `BAT_MID` (Bateria em Nível Médio), `STOP` (Parada Operacional).
* **Eventos Raros:** `OBS_DET` (Obstáculo Detectado via LiDAR), `EMERGENCY_TRIP` (Parada de Emergência).

Se usarmos uma codificação de tamanho fixo de 8 bits (ASCII ou Byte tradicional) para cada evento, desperdiçamos largura de banda transmitindo repetidamente informações triviais (`OK`) com a mesma quantidade de bits necessária para mensagens raras e complexas.

### O Princípio da Codificação de Tamanho Variável:
* Caracteres/Status **mais frequentes** recebem códigos de bits **mais curtos**.
* Caracteres/Status **menos frequentes** recebem códigos de bits **mais longos**.
* **Propriedade Livre de Prefixo (*Prefix-Free Code*):** Nenhum código de um símbolo pode ser o prefixo de outro código, permitindo que o receptor decodifique a mensagem de forma determinística e sem ambiguidades.

---

## 3. Construção da Árvore de Huffman

A estrutura subjacente do algoritmo é uma **Árvore Binária de Compressão**. A construção da árvore segue uma abordagem gulosa (*Greedy*) utlizando uma fila de prioridade (*Min-Heap*):

### Passo a Passo da Construção:

1. **Frequência de Eventos:** Mede-se a contagem/probabilidade de ocorrência de cada evento $s_i$ no histórico do AGV.
2. **Nós Folha:** Cada evento único é transformado em um nó contendo seu símbolo e sua frequência.
3. **Fila de Prioridade (Min-Heap):** Todos os nós são inseridos em uma fila de prioridade ordenada por frequência.
4. **Agrupamento Guloso:**
   * Remove-se os dois nós com as **menores frequências** ($n_1$ e $n_2$).
   * Cria-se um novo nó pai com peso igual à soma das frequências ($n_{\text{pai}} = n_1 + n_2$).
   * Define-se $n_1$ como filho esquerdo (bit `0`) e $n_2$ como filho direito (bit `1`).
   * Reinsere-se o nó pai na fila de prioridade.
5. **Conclusão:** O processo é repetido até que reste apenas um nó na fila (a raiz da Árvore de Huffman).

---

## 4. Estrutura Matemática e Desempenho

A eficiência do algoritmo é mensurada comparando o tamanho médio do código comprimido $L$ com a **Entropia de Shannon** ($H$), que estabelece o limite teórico de compressão de uma fonte de dados:

$$H(X) = - \sum_{i=1}^{k} P(s_i) \log_2 P(s_i)$$

O comprimento médio das palavras de código geradas pela Árvore de Huffman é dado por:

$$L = \sum_{i=1}^{k} P(s_i) \cdot l(s_i)$$

Onde:
* $P(s_i)$ é a probabilidade do evento de telemetria $s_i$.
* $l(s_i)$ é o comprimento em bits da palavra de código gerada pelo caminho da raiz até a folha na Árvore de Huffman.

Pelo **Teorema de Codificação da Fonte de Shannon**:
$$H(X) \le L < H(X) + 1$$

---

## 5. Aplicação Prática no Projeto Visão-AGV

A aplicação da Codificação de Huffman no nosso sistema autônomo entrega os seguintes benefícios operacionais:

1. **Redução de Payload:** Diminui em até 60% o volume de dados trafegados entre os robôs móveis e o sistema supervisor SCADA.
2. **Priorização de Eventos Críticos:** Garante que o stream de dados de rotina use uma fração mínima do espectro de rádio da fábrica.
3. **Decodificação Determinística $O(N)$:** O servidor supervisor decodifica o stream comprimido navegando nó a nó pela árvore conforme lê os bits `0` e `1`.