# Aula 04: Lógica Proposicional — Conectivos e Blocos de Permissivos

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