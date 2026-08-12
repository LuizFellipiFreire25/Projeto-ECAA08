# Representação Simbólica das Regras de Processo e Intertravamentos

Com base no mapeamento, as intertravas de segurança e permissivos de movimentação do AGV são traduzidos em equações de lógica proposicional.

### A. Intertrava de Trip de Emergência do AGV (Shutdown)
O motor de tração ($m_1$) e o braço robótico ($a_1$) devem ser imediatamente DESLIGADOS e RECOLHIDOS ($\neg m_1 \land \neg a_1$), e o alarme acionado ($l_1$) se houver acionamento da emergência, bateria crítica ou gás tóxico extremo na rota.

**Condição de Falha Crítica / Trip (F):**
$$F \equiv s_1 \lor b_1 \lor g_1$$

**Equação Lógica de Intertravamento:**
$$F \rightarrow (\neg m_1 \land \neg a_1 \land l_1)$$

### B. Permissivo de Movimento (Modo Follow-Me)
Para que o AGV possa avançar ($m_1$), a câmera DEVE estar detectando o operador ($c_1$), o operador NÃO PODE estar perto demais para evitar atropelamento ($\neg d_1$), e NÃO PODE haver condição de falha ativa ($\neg F$).

**Regra Operacional de Tração:**
$$m_1 \rightarrow (c_1 \land \neg d_1 \land \neg F)$$

### C. Proteção do Braço de Amostragem (Colisão)
Para evitar acidentes durante a coleta na planta química, o braço robótico ($a_1$) só tem permissão para operar se o AGV estiver TOTALMENTE PARADO (sem tração).

**Regra de Intertravamento do Braço:**
$$a_1 \rightarrow (\neg m_1)$$

---

## Validação Formal por Prova Lógica (Tautologia de Segurança)

Para demonstrar ao motor do SCADA-Core que **o AGV nunca atropelará o operador no modo autônomo** durante uma falha crítica, constrói-se a prova formal do teorema de segurança.

**Afirmação de Segurança:** "Não é possível ter uma falha crítica ($F$) E manter o motor de tração do AGV ligado ($m_1$) simultaneamente."

**Proposição do Estado de Risco ($S_{risco}$):**
$$S_{risco} \equiv F \land m_1$$

Dada a regra de intertravamento implementada no controlador (reorganizada da Regra B, onde tração implica ausência de falha):
$$m_1 \rightarrow \neg F$$

Aplica-se a equivalência lógica do condicional ($A \rightarrow B \equiv \neg A \lor B$):
$$m_1 \rightarrow \neg F \equiv \neg m_1 \lor \neg F$$

Substituindo o estado de risco sob a premissa de que a regra de intertravamento é estritamente VERDADEIRA:
$$S_{risco} \land (\neg m_1 \lor \neg F)$$
$$(F \land m_1) \land (\neg m_1 \lor \neg F)$$

Distribuindo a operação $(F \land m_1)$:
$$((F \land m_1) \land \neg m_1) \lor ((F \land m_1) \land \neg F)$$

Aplicando as contradições lógicas básicas ($A \land \neg A \equiv \text{Falso}$):
$$(F \land \text{Falso}) \lor (m_1 \land \text{Falso})$$
$$\text{Falso} \lor \text{Falso} \equiv \text{FALSO}$$

**Conclusão:** O estado de risco é uma contradição lógica. O intertravamento é matematicamente seguro.