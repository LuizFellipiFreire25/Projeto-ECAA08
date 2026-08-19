# Aula 04: Lógica Proposicional — Conectivos e Blocos de Permissivos

## 1. Fundamentos Matemáticos: Conectivos Lógicos

Na matemática discreta, uma *proposição* é uma sentença declarativa que assume um e apenas um valor-verdade: *Verdadeiro* ($1$) ou *Falso* ($0$).

As operações sobre variáveis proposicionais são definidas por operadores lógicos fundamentais:
1. *Negação ($\neg A$ ou $\bar{A}$):* Inverte o valor-verdade da proposição.
2. *Conjunção ($A \land B$):* Verdadeira se e somente se ambos os operandos forem verdadeiros. Em automação e robótica, modela condições em *série* (intertravamento e permissivos conjuntos de segurança).
3. *Disjunção ($A \lor B$):* Verdadeira se ao menos um dos operandos for verdadeiro. Em automação, modela redundâncias ou condições em *paralelo* (múltiplas causas de falha ou parada).
4. *Disjunção Exclusiva ($A \oplus B$):* Verdadeira se exatamente um dos operandos for verdadeiro ($\neg(A \leftrightarrow B)$). Usada em seletores de modo operacional do AGV (Modo Autônomo $\oplus$ Modo Manual).
5. *Implicação / Condicional ($A \rightarrow B$):* $\neg A \lor B$. Modela regras operacionais "SE condição $A$ (falha), ENTÃO ação $B$ (freio acionado)".
6. *Bicondicional ($A \leftrightarrow B$):* $(A \rightarrow B) \land (B \rightarrow A)$. Modela equivalência de estados operacionais.