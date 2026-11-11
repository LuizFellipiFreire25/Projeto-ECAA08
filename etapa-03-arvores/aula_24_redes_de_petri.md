# Aula 24: Árvore de Atingibilidade e Cobertura em Redes de Petri aplicadas ao Visão-AGV

## 1. Contextualização: Sistemas Concorrentes no Visão-AGV

No gerenciamento de frotas de robôs móveis, o sistema **SCADA-Core** precisa orquestrar múltiplos AGVs operando simultaneamente. Essa operação gera cenários de **concorrência e disputa por recursos compartilhados**, tais como:
* Dois AGVs solicitando acesso simultâneo a um corredor de sentido único (nó de trânsito restrito).
* Múltiplos robôs competindo por uma mesma Estação de Recarga.
* Filas de tarefas se acumulando nos pontos de transferência (*handoff*) das células de manufatura.

Para modelar matematicamente esses sistemas de eventos discretos e provar que a operação é segura (livre de travamentos), utilizamos as **Redes de Petri (RdP)**. Para analisar o comportamento dinâmico de uma Rede de Petri, construímos estruturas hierárquicas baseadas em árvores: a **Árvore de Atingibilidade** e a **Árvore de Cobertura**.

## 2. A Árvore de Atingibilidade (Reachability Tree)

A Árvore de Atingibilidade mapeia **todos os estados possíveis** que o sistema pode alcançar a partir de um estado inicial. 

Em uma Rede de Petri, o estado do sistema é chamado de **Marcação** ($M$), que representa a distribuição de "fichas" (tokens) nos "lugares" (places) da rede. 

### Como é construída:
1. **Nó Raiz:** O processo inicia-se com a marcação inicial $M_0$ (ex: Frota aguardando comandos, corredores livres).
2. **Transições:** Avalia-se quais eventos (transições $t$) estão habilitados para ocorrer em $M_0$.
3. **Expansão:** Para cada transição habilitada, simula-se o seu disparo (ex: AGV-1 entra no corredor). Isso gera uma nova marcação $M_1$.
4. **Arestas:** Cria-se um arco direcionado de $M_0$ para $M_1$ rotulado com a transição disparada.
5. **Critério de Parada:** A expansão de um ramo para quando se atinge uma marcação que já existe na árvore (nó duplicado) ou quando nenhuma transição pode ser disparada.

### Aplicação: Detecção de Deadlock no AGV
Se a Árvore de Atingibilidade possui um nó folha onde **nenhuma transição está habilitada**, encontramos um estado de *Deadlock* (Impasse). 
No **Visão-AGV**, isso representaria uma falha crítica de tráfego, onde dois robôs bloqueiam um ao outro em um cruzamento estreito de forma irreversível, exigindo intervenção manual. A análise da árvore garante que o layout e as regras de semáforo virtual previnam esse estado.

## 3. A Árvore de Cobertura (Coverability Tree)

A Árvore de Atingibilidade funciona perfeitamente para sistemas com estados finitos. Porém, no ambiente de manufatura contínua, certos recursos podem crescer indefinidamente em teoria.

**O Problema:** Imagine o *Buffer* de tarefas do SCADA. Se o sistema ERP envia ordens de produção mais rápido do que os AGVs conseguem executar, a fila de transporte (tokens em um lugar da rede) cresce ao infinito. Isso geraria uma Árvore de Atingibilidade infinita, impossível de ser computada.

**A Solução (Árvore de Cobertura):** 
Para lidar com o infinito, introduzimos o símbolo $\omega$ (ômega), que representa um valor arbitrariamente grande (infinito). 

### Regra de Cobertura:
Durante a construção da árvore, se ao ir de uma marcação $M_i$ para uma nova marcação $M_j$, notarmos que:
1. O caminho no grafo indica um ciclo repetitivo.
2. A marcação $M_j$ é estritamente maior que $M_i$ (ou seja, possui pelo menos a mesma quantidade de tokens em todos os lugares, e mais tokens em algum lugar específico).

Nesse caso, substituímos o valor crescente por $\omega$. Isso "trunca" o crescimento infinito da árvore, permitindo que a análise termine em tempo finito.

## 4. Análise Matemática de Propriedades

Ao gerar a Árvore de Cobertura/Atingibilidade para o controle de tráfego do nosso sistema intralogístico, podemos provar matematicamente propriedades vitais:

* **Limitação (Boundedness):** Se o símbolo $\omega$ não aparece em nenhum lugar da Árvore de Cobertura, a rede é dita Limitada. No nosso projeto, isso prova que o buffer de memória do microcontrolador do AGV não sofrerá *overflow* (estouro de memória).
* **Conservação:** Verifica se o número total de recursos (como as credenciais de acesso às zonas de exclusão) permanece constante no sistema.
* **Viva (Liveness):** Prova que, independente do estado atual $M$, sempre haverá uma sequência de comandos capaz de habilitar qualquer ação dos atuadores do AGV.

## 5. Conclusão para o Visão-AGV

A aplicação da teoria das Árvores em Redes de Petri não apenas documenta a lógica de controle da frota, mas serve como um **verificador formal de segurança (Model Checking)**. Antes de enviar o código de navegação para os controladores físicos dos AGVs, a geração computacional destas árvores assegura que as regras de acesso às células de manufatura são robustas contra falhas de sincronização e impasses físicos.