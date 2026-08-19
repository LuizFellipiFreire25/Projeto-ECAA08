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