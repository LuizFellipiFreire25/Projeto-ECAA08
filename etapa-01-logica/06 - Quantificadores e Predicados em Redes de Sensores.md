# Aula 06: Lógica de Predicados e Quantificadores na Malha de Sensores do AGV

## 1. Fundamentos Matemáticos: Lógica de Primeira Ordem (FOL)

Enquanto a lógica proposicional trata sentenças atômicas isoladas ($c_1, g_1, s_1$), a **Lógica de Predicados (Lógica de Primeira Ordem - FOL)** permite parametrizar propriedades sobre domínios e conjuntos finitos de subsistemas mecatrônicos do AGV e da planta industrial:

* **Predicado $P(x)$:** Função booleana $P: U \rightarrow \{0, 1\}$ onde $U$ é o universo de discurso (ex: conjunto de sensores de campo $\mathcal{S}_{AGV}$, malha de câmeras de visão $\mathcal{C}_{IA}$, módulos de bateria da frota $\mathcal{B}$).
* **Quantificador Universal ($\forall x \in U, \; P(x)$):**
  * "Para todo elemento $x$ em $U$, a propriedade $P(x)$ é Verdadeira".
  * Modela condições de integridade total (ex: todos os módulos de bateria estão saudáveis para liberar o percurso).
  * Expansão em domínio finito $U = \{x_1, x_2, \dots, x_n\}$:
    $$\forall x P(x) \equiv P(x_1) \land P(x_2) \land \dots \land P(x_n)$$
* **Quantificador Existencial ($\exists x \in U, \; P(x)$):**
  * "Existe ao menos um $x$ em $U$ tal que $P(x)$ é Verdadeiro".
  * Modela disparo de falhas e alarmes de emergência (ex: se ao menos um sensor de gás da malha detectar vazamento, o robô para).
  * Expansão em domínio finito:
    $$\exists x P(x) \equiv P(x_1) \lor P(x_2) \lor \dots \lor P(x_n)$$

---

## 2. Aplicação no AGV: Verificação de Segurança na Malha de Instrumentos

No SCADA-Core do AGV, definimos o universo de sensores de segurança embarcados $\mathcal{S}_{AGV} = \{s_1 \text{ (E-Stop)}, g_1 \text{ (Gás)}, b_1 \text{ (Bateria)}, d_1 \text{ (Colisão)}\}$.

### 2.1. Condição de Integridade Total ($\text{Permissivo}_{\forall}$)
Para que o percurso autônomo seja autorizado, **TODOS** os sensores do domínio $\mathcal{S}_{AGV}$ devem relatar estado normal ($\neg Fault(x)$):

$$\text{Permissivo}_{\forall} \equiv \forall x \in \mathcal{S}_{AGV}, \; \neg Fault(x)$$
$$\text{Permissivo}_{\forall} \equiv \neg Fault(s_1) \land \neg Fault(g_1) \land \neg Fault(b_1) \land \neg Fault(d_1)$$

### 2.2. Disparo de Parada por Falha Distribuída ($\text{Trip}_{\exists}$)
Se **QUALQUER** sensor de campo registrar uma anomalia ($Fault(x) = 1$), a rotina de interrupção imediata (*Trip*) é ativada no CLP:

$$\text{Trip}_{\exists} \equiv \exists x \in \mathcal{S}_{AGV}, \; Fault(x)$$
$$\text{Trip}_{\exists} \equiv Fault(s_1) \lor Fault(g_1) \lor Fault(b_1) \lor Fault(d_1)$$

Pela negação de quantificadores (Lei de De Morgan para FOL):

$$\neg (\forall x P(x)) \equiv \exists x \neg P(x)$$
$$\neg \text{Permissivo}_{\forall} \equiv \text{Trip}_{\exists}$$

---

## 3. Entregável da Aula 06

* **Motor de Varredura de Predicados em Redes de Sensores do AGV:** Módulo em Python que implementa operadores `FORALL` e `EXISTS` sobre o array de telemetria do AGV, com injeção dinâmica de falhas distribuídas (E-stop, alarme de gás, bateria baixa e obstáculo de visão) para validação do SCADA-Core.
