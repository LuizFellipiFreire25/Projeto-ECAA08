# Aula 16: Problemas Eulerianos e Inspeção Autônoma da Malha Logística

## 1. Fundamentos Matemáticos: Teorema de Euler e Circuitos Eulerianos

No sistema *SCADA-Core / Visão-AGV, existem rotinas de manutenção onde o veículo autônomo precisa inspecionar a integridade física de **todos os corredores* do galpão (ex: mapeamento de desgaste do piso, checagem de marcadores RFID, verificação de estruturas ou limpeza). 

Para garantir a máxima eficiência energética e poupar a bateria do AGV, o trajeto deve percorrer cada corredor (aresta) exatamente uma vez e retornar à base. Este é o clássico *Problema do Carteiro Chinês* ou a busca por um *Circuito Euleriano*.

*Teorema de Euler:*
Um Circuito Euleriano existe em um grafo não-dirigido conexo $G = (V, E)$ se e somente se:
1. Todos os vértices $v \in V$ possuem *grau par* (número par de arestas conectadas).

Em grafos dirigidos, exige-se que o grau de entrada seja igual ao grau de saída: $\text{deg}^+(v) = \text{deg}^-(v)$ para todo nó $v$. 

O *Algoritmo de Hierholzer* será utilizado para construir este circuito em tempo linear $\mathcal{O}(\vert{}E\vert{})$, unindo sub-ciclos até cobrir toda a infraestrutura.

---

## 2. Diagrama da Malha de Inspeção Euleriana (Mermaid)

Para que a inspeção ocorra sem repetições de corredores, modelamos um setor do galpão como um grafo não-dirigido onde todos os nós (estações) possuem grau par (2 ou 4 conexões).

```mermaid
graph LR
    ST01["ST-01: Estação Base (Grau 2)"] --- DOC101["DOC-101: Doca (Grau 4)"]
    ST01 --- DEP401["DEP-401: Depósito (Grau 4)"]
    DOC101 --- ALM201["ALM-201: Almoxarifado (Grau 2)"]
    DOC101 --- R101["R-101: Reator Químico (Grau 2)"]
    DOC101 --- DEP401
    ALM201 --- AMO301["AMO-301: Posto Amostragem (Grau 2)"]
    AMO301 --- DEP401
    R101 --- DEP401