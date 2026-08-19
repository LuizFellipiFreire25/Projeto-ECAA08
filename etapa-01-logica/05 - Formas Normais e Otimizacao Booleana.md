# Aula 05: Formas Normais (FND/FNC) e Otimização Booleana

## 1. Fundamentos Matemáticos: Formas Normais

Qualquer fórmula da lógica proposicional pode ser convertida para uma forma padrão canônica para facilitar a análise computacional:

1. **Forma Normal Disjuntiva (FND / Soma de Produtos - SOP):**
   - Uma disjunção ($\lor$) de termos conjuntivos (mintermos).
   - Estrutura: $(L_{1,1} \land \dots \land L_{1,k}) \lor (L_{2,1} \land \dots \land L_{2,m}) \lor \dots$
   - Representa todos os estados nos quais a saída do sistema é **Verdadeira** ($1$).
   - Ideal para síntese de circuitos lógicos, programação estruturada (IF/OR) em C++ e modelagem de permissivos com múltiplos caminhos redundantes.

2. **Forma Normal Conjuntiva (FNC / Produto de Somas - POS):**
   - Uma conjunção ($\land$) de termos disjuntivos (maxtermos/cláusulas).
   - Estrutura: $(C_{1,1} \lor \dots \lor C_{1,k}) \land (C_{2,1} \lor \dots \lor C_{2,m}) \land \dots$
   - Representa a interseção de restrições de segurança que devem ser **simultaneamente** respeitadas.
   - Ideal para algoritmos de prova de teoremas e intertravamento de segurança (*Safety Matrix*) do CLP Embarcado.

---

## 2. Álgebra Booleana e Leis de Simplificação

Para minimizar o consumo de CPU e memória no microcontrolador (SCADA-Core), garantindo tempo de resposta crítico (baixa latência), aplicam-se as identidades booleanas para otimizar as expressões:

| Lei | Formulação Disjuntiva | Formulação Conjuntiva |
| :--- | :--- | :--- |
| **Identidade** | $A \lor 0 \equiv A$ | $A \land 1 \equiv A$ |
| **Dominação** | $A \lor 1 \equiv 1$ | $A \land 0 \equiv 0$ |
| **Idempotência** | $A \lor A \equiv A$ | $A \land A \equiv A$ |
| **Complemento** | $A \lor \neg A \equiv 1$ | $A \land \neg A \equiv 0$ |
| **Dupla Negação** | $\neg(\neg A) \equiv A$ | - |
| **Comutatividade** | $A \lor B \equiv B \lor A$ | $A \land B \equiv B \land A$ |
| **Associatividade** | $(A \lor B) \lor C \equiv A \lor (B \lor C)$ | $(A \land B) \land C \equiv A \land (B \land C)$ |
| **Distributividade** | $A \lor (B \land C) \equiv (A \lor B) \land (A \lor C)$ | $A \land (B \lor C) \equiv (A \land B) \lor (A \land C)$ |
| **De Morgan** | $\neg(A \land B) \equiv \neg A \lor \neg B$ | $\neg(A \lor B) \equiv \neg A \land \neg B$ |
| **Absorção** | $A \lor (A \land B) \equiv A$ | $A \land (A \lor B) \equiv A$ |

---

## 3. Aplicação na Automação: Otimização da Lógica de Tração do AGV (Setor 300)

Considere a expressão original e não otimizada do comando do Motor de Tração ($cmd_{M301}$). 
Neste cenário hipotético, o robô pode andar se estiver seguro ($\neg F$), mas há uma condição de "Override Manual" ($O_m$) que permite mover o robô lentamente em caso de falha de sensor. O algoritmo original do código estava escrito assim:

$$cmd_{M301} = (c_1 \land \neg d_1 \land \neg F) \lor (c_1 \land \neg d_1 \land F \land O_m) \lor (c_1 \land \neg c_1 \land \neg d_1)$$

1. O termo $(c_1 \land \neg c_1 \land \neg d_1)$ contém uma contradição óbvia (complemento): $c_1 \land \neg c_1 \equiv 0 \implies 0 \land \neg d_1 \equiv 0$. O termo é eliminado.
2. Fatorando o trecho em comum $(c_1 \land \neg d_1)$:
   $$cmd_{M301} \equiv (c_1 \land \neg d_1) \land (\neg F \lor (F \land O_m))$$
3. Pela regra de distribuição com absorção $(\neg A \lor (A \land B) \equiv \neg A \lor B)$:
   $$cmd_{M301\_otimizado} \equiv c_1 \land \neg d_1 \land (\neg F \lor O_m)$$

**Conclusão:** Redução de $10$ operações lógicas para apenas $4$. O motor avança se houver operador ($c_1$), não houver risco de colisão ($\neg d_1$) **E** o sistema estiver sem falhas ou em override ($\neg F \lor O_m$). Essa simplificação reduz drasticamente a latência do *scan cycle* no processamento embarcado.

---

Em qua., 19 de ago. de 2026, 14:43, Vinicius Resende <vgresende80@gmail.com> escreveu:
[19/08, 11:17] Luis: # Aula 04: Lógica Proposicional — Conectivos e Blocos de Permissivos

## 1. Fundamentos Matemáticos: Conectivos Lógicos

Na matemática discreta, uma **proposição** é uma sentença declarativa que assume um e apenas um valor-verdade: **Verdadeiro** ($1$) ou **Falso** ($0$).

As operações sobre variáveis proposicionais são definidas por operadores lógicos fundamentais:
1. **Negação ($\neg A$ ou $\bar{A}$):** Inverte o valor-verdade da proposição.
2. **Conjunção ($A \land B$):** Verdadeira se e somente se ambos os operandos forem verdadeiros. Em automação e robótica, modela condições em **série** (intertravamento e permissivos conjuntos de segurança).
3. **Disjunção ($A \lor B$):** Verdadeira se ao menos um dos operandos for verdadeiro. Em automação, modela redundâncias ou condições em **paralelo** (múltiplas causas de falha ou parada).
4. **Disjunção Exclusiva ($A \oplus B$):** Verdadeira se exatamente um dos operandos for verdadeiro ($\neg(A \leftrightarrow B)$). Usada em seletores de modo operacional do AGV (Modo Autônomo $\oplus$ Modo Manual).
5. **Implicação / Condicional ($A \rightarrow B$):** $\neg A \lor B$. Modela regras operacionais "SE condição $A$ (falha), ENTÃO ação $B$ (freio acionado)".
6. **Bicondicional ($A \leftrightarrow B$):** $(A \rightarrow B) \land (B \rightarrow A)$. Modela equivalência de estados operacionais.

---

## 2. Aplicação em Engenharia: Permissivos de Partida de Equipamentos Críticos

Em controle e mecatrônica, um **permissivo de partida** (*Start Permissive*) é uma condição booleana que deve ser estritamente satisfeita para que um atuador de potência (motor de tração, atuador linear, servo motor) possa receber o comando de energização do CLP.

### 2.1. Permissivo do Motor DC de Tração Principal ($P_{\text{M-301}}$)
O motor de tração $\text{M-301}$ é responsável por mover o AGV pela planta química. Seu acionamento autônomo ($cmd_{\text{M-301}}$) exige que todas as condições de IA e segurança de hardware sejam atendidas:
- Operador detectado pela câmera com confiança $> 50\%$: $c_1$
- Operador a uma distância segura (fora da *bounding box* crítica): $\neg d_1$
- Ausência de vazamento de gás $\text{NH}_3$ na rota: $\neg g_1$
- Bateria em nível operacional: $\neg b_1$
- Botão de emergência liberado: $\neg s_1$
- Modo de navegação claramente definido: $\text{Autônomo} \oplus \text{Manual}$

$$P_{\text{M-301}} \equiv c_1 \land \neg d_1 \land \neg g_1 \land \neg b_1 \land \neg s_1 \land (\text{Autônomo} \oplus \text{Manual})$$

```mermaid
graph LR
    L1["c_1 (Operador Detectado)"] --> AND["Bloco AND (Conjunção)"]
    L2["¬ d_1 (Distância Segura)"] --> AND
    L3["¬ g_1 (Sem Gás Tóxico)"] --> AND
    L4["¬ b_1 (Bateria OK)"] --> AND
    L5["¬ s_1 (Sem Emergência)"] --> AND
    L6["Autônomo XOR Manual"] --> AND
    AND --> Permissivo["Permissivo Motor M-301 (True/False)"]
[19/08, 11:33] Luis: # Aula 05: Formas Normais (FND/FNC) e Otimização Booleana

## 1. Fundamentos Matemáticos: Formas Normais

Qualquer fórmula da lógica proposicional pode ser convertida para uma forma padrão canônica para facilitar a análise computacional:

1. **Forma Normal Disjuntiva (FND / Soma de Produtos - SOP):**
   - Uma disjunção ($\lor$) de termos conjuntivos (mintermos).
   - Estrutura: $(L_{1,1} \land \dots \land L_{1,k}) \lor (L_{2,1} \land \dots \land L_{2,m}) \lor \dots$
   - Representa todos os estados nos quais a saída do sistema é **Verdadeira** ($1$).
   - Ideal para síntese de circuitos lógicos, programação estruturada (IF/OR) em C++ e modelagem de permissivos com múltiplos caminhos redundantes.

2. **Forma Normal Conjuntiva (FNC / Produto de Somas - POS):**
   - Uma conjunção ($\land$) de termos disjuntivos (maxtermos/cláusulas).
   - Estrutura: $(C_{1,1} \lor \dots \lor C_{1,k}) \land (C_{2,1} \lor \dots \lor C_{2,m}) \land \dots$
   - Representa a interseção de restrições de segurança que devem ser **simultaneamente** respeitadas.
   - Ideal para algoritmos de prova de teoremas e intertravamento de segurança (*Safety Matrix*) do CLP Embarcado.

---

## 2. Álgebra Booleana e Leis de Simplificação

Para minimizar o consumo de CPU e memória no microcontrolador (SCADA-Core), garantindo tempo de resposta crítico (baixa latência), aplicam-se as identidades booleanas para otimizar as expressões:

| Lei | Formulação Disjuntiva | Formulação Conjuntiva |
| :--- | :--- | :--- |
| **Identidade** | $A \lor 0 \equiv A$ | $A \land 1 \equiv A$ |
| **Dominação** | $A \lor 1 \equiv 1$ | $A \land 0 \equiv 0$ |
| **Idempotência** | $A \lor A \equiv A$ | $A \land A \equiv A$ |
| **Complemento** | $A \lor \neg A \equiv 1$ | $A \land \neg A \equiv 0$ |
| **Dupla Negação** | $\neg(\neg A) \equiv A$ | - |
| **Comutatividade** | $A \lor B \equiv B \lor A$ | $A \land B \equiv B \land A$ |
| **Associatividade** | $(A \lor B) \lor C \equiv A \lor (B \lor C)$ | $(A \land B) \land C \equiv A \land (B \land C)$ |
| **Distributividade** | $A \lor (B \land C) \equiv (A \lor B) \land (A \lor C)$ | $A \land (B \lor C) \equiv (A \land B) \lor (A \land C)$ |
| **De Morgan** | $\neg(A \land B) \equiv \neg A \lor \neg B$ | $\neg(A \lor B) \equiv \neg A \land \neg B$ |
| **Absorção** | $A \lor (A \land B) \equiv A$ | $A \land (A \lor B) \equiv A$ |

---

## 3. Aplicação na Automação: Otimização da Lógica de Tração do AGV (Setor 300)

Considere a expressão original e não otimizada do comando do Motor de Tração ($cmd_{M301}$). 
Neste cenário hipotético, o robô pode andar se estiver seguro ($\neg F$), mas há uma condição de "Override Manual" ($O_m$) que permite mover o robô lentamente em caso de falha de sensor. O algoritmo original do código estava escrito assim:

$$cmd_{M301} = (c_1 \land \neg d_1 \land \neg F) \lor (c_1 \land \neg d_1 \land F \land O_m) \lor (c_1 \land \neg c_1 \land \neg d_1)$$

1. O termo $(c_1 \land \neg c_1 \land \neg d_1)$ contém uma contradição óbvia (complemento): $c_1 \land \neg c_1 \equiv 0 \implies 0 \land \neg d_1 \equiv 0$. O termo é eliminado.
2. Fatorando o trecho em comum $(c_1 \land \neg d_1)$:
   $$cmd_{M301} \equiv (c_1 \land \neg d_1) \land (\neg F \lor (F \land O_m))$$
3. Pela regra de distribuição com absorção $(\neg A \lor (A \land B) \equiv \neg A \lor B)$:
   $$cmd_{M301\_otimizado} \equiv c_1 \land \neg d_1 \land (\neg F \lor O_m)$$

**Conclusão:** Redução de $10$ operações lógicas para apenas $4$. O motor avança se houver operador ($c_1$), não houver risco de colisão ($\neg d_1$) **E** o sistema estiver sem falhas ou em override ($\neg F \lor O_m$). Essa simplificação reduz drasticamente a latência do *scan cycle* no processamento embarcado.

---
