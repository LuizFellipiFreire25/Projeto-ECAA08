# Aula 25: Árvores de Comportamento (Behavior Trees) na Arquitetura Autônoma do Visão-AGV

## 1. Contextualização e Motivação no Projeto Visão-AGV

À medida que o robô **Visão-AGV** lida com múltiplos objetivos dinâmicos — como seguir caminhos de roteamento, monitorar a carga da bateria, desviar de obstáculos não mapeados e responder a sinais de emergência do SCADA —, a lógica de controle embarcada torna-se complexa.

Historicamente, Máquinas de Estados Finitos (FSM - *Finite State Machines*) eram utilizadas para alternar comportamentos. Contudo, em sistemas robóticos avançados, as FSMs apresentam problemas de escalabilidade e alto acoplamento: adicionar um novo estado de emergência exige alterar dezenas de transições manuais, tornando o código propenso a erros.

A **Árvore de Comportamento (Behavior Tree - BT)** é uma estrutura de dados hierárquica baseada em árvores binárias/n-árias que substitui as FSMs na robótica móvel. Ela oferece:

* **Modularidade Extrema:** Novos comportamentos de segurança podem ser inseridos como sub-árvores sem alterar os nós existentes.

* **Reatividade em Tempo Real:** A árvore é reavaliada recursivamente a cada ciclo de controle do microcontrolador (ex: a 50 Hz).

* **Manutenibilidade:** Separação clara entre condições de teste (sensores) e ações (motores/atuadores).

## 2. Estrutura e Mecânica de Execução das Behavior Trees

Uma Árvore de Comportamento é executada através da emissão periódica de um sinal de varredura chamado **Tick**, que parte do nó raiz e percorre os filhos de acordo com regras lógicas rígidas.

Cada nó da árvore retorne obrigatoriamente um de três estados operacionais:

1. **`SUCCESS` (Sucesso):** O objetivo do nó foi concluído com exito.

2. **`FAILURE` (Falha):** O nó não conseguiu cumprir sua condição ou ação.

3. **`RUNNING` (Em Execução):** A ação está sendo processada e requer mais tempo de CPU/motores nos próximos *ticks*.

---

### Tipos de Nós em uma Behavior Tree

```
                       [ Raiz (Fallback / Sequence) ]
                                /          \
             [ Decorador: Bateria? ]     [ Seletor de Ação ]
                      /                       /           \
           (Ação: Ir para Recarga)   (Sub-árvore Desvio) (Ação: Seguir Rota)
```

#### A. Nós de Controle (Control Nodes - Internos)

* **Seletor / Fallback (`?`):** Executa os filhos da esquerda para a direita. Se um filho retornar `SUCCESS` ou `RUNNING`, o Seletor para a avaliação e retorna esse mesmo estado imediatamente. Só retorna `FAILURE` se **todos** os seus filhos falharem. (Funciona como a porta lógica *OR*).

* **Sequência (`->`):** Executa os filhos da esquerda para a direita. Se um filho retornar `FAILURE`, a Sequência para e retorna `FAILURE`. Só retorna `SUCCESS` quando **todos** os filhos retornarem `SUCCESS`. (Funciona como a porta lógica *AND*).

#### B. Nós Folha (Leaf Nodes - Executores)

* **Condição (Condition):** Testa um valor numérico ou booleano lido dos sensores (ex: `Bateria < 15%?`, `Obstáculo a 0.5m?`). Retorna instantaneamente `SUCCESS` ou `FAILURE`.

* **Ação (Action):** Interage diretamente com os atuadores do AGV (ex: `Calcular RRT`, `Publicar Velocidade (v, w)`, `Acionar Buzzer`). Pode retornar `RUNNING` enquanto o movimento estiver acontecendo.

#### C. Nós Decoradores (Decorator Nodes)

* Modificam o resultado do nó filho (ex: Inversor `NOT`, Limitador de Tentativas, Repetidor).

## 3. A Árvore de Comportamento do Visão-AGV

A arquitetura de controle do nosso veículo autônomo é modelada conforme a seguinte hierarquia de prioridades (da esquerda para a direita):

1. **Prioridade 1 (Segurança Crítica):** Parada imediata em caso de botão de emergência acionado ou detecção de colisão iminente via LiDAR.

2. **Prioridade 2 (Gerenciamento de Energia):** Se o nível de bateria for crítico, abortar a missão atual e navegar em direção à Estação de Recarga (`ST-01_Base`).

3. **Prioridade 3 (Desvio Dinâmico de Obstáculos):** Se um obstáculo bloquear o corredor principal, acionar o planejador local (RRT - Aula 22).

4. **Prioridade 4 (Navegação Nominal):** Seguir a sequência de *waypoints* do plano de missão enviado pelo supervisor SCADA.

## 4. Vantagens no Ecossistema Visão-AGV / SCADA-Core

* **Tratamento de Exceções Determinístico:** A estrutura em sub-árvores garante que a segurança sempre se sobreponha à missão de entrega, eliminando travamentos de código.

* **Integração com ROS 2 (Nav2):** O padrão *Behavior Tree* é o padrão mundial adotado pela pilha de navegação robótica `BehaviorTree.CPP` do ROS 2, alinhando o projeto com as melhores práticas industriais.

* **Facilidade de Auditoria:** O supervisor SCADA pode registrar o estado de cada nó (`SUCCESS`, `FAILURE`, `RUNNING`) em tempo real, permitindo aos engenheiros visualizar exatamente por que o AGV tomou uma decisão específica em determinado segundo.