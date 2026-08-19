# Representação Simbólica das Regras de Processo e Intertravamentos

Com base no mapeamento, as intertravas de segurança (*Safety Interlocks*) e permissivos de movimentação do AGV são traduzidos em equações de lógica proposicional.

## A. Intertrava de Trip de Emergência do AGV (Shutdown)

O motor de tração ($m_1$) e o braço robótico ($a_1$) devem ser imediatamente DESLIGADOS ($\neg m_1 \land \neg a_1$) e o alarme acionado ($l_1$) se houver acionamento da emergência, bateria crítica ou gás tóxico extremo na rota.

* **Condição de Falha Crítica / Trip ($F$):**

$$F \equiv s_1 \lor b_1 \lor g_1$$

* **Equação Lógica de Intertravamento:**

$$F \rightarrow (\neg m_1 \land \neg a_1 \land l_1)$$

## B. Permissivo de Movimento (Modo Follow-Me)

Para que o AGV possa avançar ($m_1$), a câmera DEVE estar detectando o operador ($c_1$), o operador NÃO PODE estar perto demais para evitar atropelamento ($\neg d_1$), e NÃO PODE haver condição de falha ativa ($\neg F$).

* **Condição de Permissivo de Movimento ($P_{mov}$):**

$$P_{mov} \equiv c_1 \land \neg d_1 \land \neg F$$

* **Regra Operacional:**

$$m_1 \rightarrow P_{mov}$$

## C. Proteção do Braço de Amostragem contra Colisão

Para evitar acidentes durante a coleta na planta química, o braço robótico ($a_1$) só tem permissão para operar se o AGV estiver TOTALMENTE PARADO (sem tração).

* **Regra de Intertravamento do Braço:**

$$a_1 \rightarrow \neg m_1$$

---

# Validação Formal por Prova Lógica (Tautologia de Segurança)

Para demonstrar ao motor do SCADA-Core que o AGV nunca atropelará o operador mantendo a tração ligada durante uma falha crítica, constrói-se a prova formal do teorema de segurança.

* **Afirmação de Segurança:** "Não é possível ter uma falha crítica ($F$) E manter o motor de tração do AGV ligado ($m_1$)."
* **Proposição do Estado de Risco ($S_{risco}$):**

$$S_{risco} \equiv F \land m_1$$

Dada a regra de intertravamento implementada no controlador (derivada da Regra B, onde tração implica ausência de falha):

$$m_1 \rightarrow \neg F$$

Aplica-se a equivalência lógica do condicional ($\mathbf{A} \rightarrow \mathbf{B} \equiv \neg \mathbf{A} \lor \mathbf{B}$):

$$m_1 \rightarrow \neg F \equiv \neg m_1 \lor \neg F$$

Substituindo o estado de risco sob a premissa de que a regra $m_1 \rightarrow \neg F$ é estritamente VERDADEIRA (restringindo o espaço de estados):

$$S_{risco} \land (\neg m_1 \lor \neg F)$$

$$(F \land m_1) \land (\neg m_1 \lor \neg F)$$

Distribuindo $(F \land m_1)$:

$$\big((F \land m_1) \land \neg m_1\big) \lor \big((F \land m_1) \land \neg F\big)$$

$$(F \land Falso) \lor (m_1 \land Falso)$$

$$Falso \lor Falso \equiv \text{FALSO}$$