# Aula 26: Árvores KD (k-d Trees) no Processamento de LiDAR e Busca Espacial do Visão-AGV

## 1. Contextualização e Motivação no Projeto Visão-AGV

Na operação autônoma do **Visão-AGV / SCADA-Core**, os sensores a bordo (como varredores LiDAR 2D/3D e câmeras de profundidade) geram nuvens de pontos densas a cada fração de segundo. Essas nuvens representam as superfícies físicas das células de manufatura, equipamentos e obstáculos ao redor do veículo.

Para que o robô tome decisões de desvio, contorno ou alinhamento com docas de carregamento em tempo real, ele precisa responder frequentemente a perguntas de geometria computacional, tais como:

1. **Busca pelo Vizinho Mais Próximo (Nearest Neighbor Search):** *"Qual é o ponto de obstáculo capturado pelo LiDAR mais próximo do chassi do AGV?"*

2. **Busca por Alcance (Range Search / Radius Search):** *"Existem pontos detectados a menos de $0,8\text{m}$ de raio (zona de risco) em relação ao centro do AGV?"*

Se realizarmos uma busca exaustiva (linear) comparando cada novo ponto com todas as milhares de amostras do mapa, a complexidade será $O(N)$, tornando o controle lento e ineficiente. A **Árvore KD ($k$-dimensional Tree)** resolve esse gargalo ao particionar o espaço euclidiano em sub-regiões hierárquicas, reduzindo a complexidade de busca para $O(\log N)$.

## 2. Conceito Teórico e Estrutura da Árvore KD

Uma **Árvore KD** é uma variação da Árvore Binária de Busca (BST) generalizada para espaços de dimensão $k$. No nosso projeto, operamos em $k=2$ (coordenadas no piso $X, Y$) ou $k=3$ (nuvem de pontos tridimensional $X, Y, Z$).

### Mecânica de Construção:

A árvore particiona o espaço usando hiperplanos perpendiculares aos eixos coordenados, alternando os eixos a cada nível da hierarquia:

* **Nível 0 (Raiz):** Divide os pontos com base na coordenada $X$ (usando a mediana dos valores de $X$).

* **Nível 1:** Divide os pontos com base na coordenada $Y$ (usando a mediana dos valores de $Y$).

* **Nível 2 (em 3D):** Divide com base na coordenada $Z$.

* **Nível 3:** Retorna a dividir pelo eixo $X$ ($\text{eixo} = \text{profundidade} \pmod k$).

```
                      [ Raiz: Corte em X = 15.0 ]
                              /           \
         [Corte em Y = 8.0 (Esq)]       [Corte em Y = 22.0 (Dir)]
                 /       \                     /        \
             (Folha)   (Folha)             (Folha)    (Folha)

```

A escolha da **mediana** como pivô garante que a árvore permaneça perfeitamente balanceada, com altura $h = \lfloor \log_2 N \rfloor$.

## 3. Algoritmos de Busca Espacial

### A. Busca pelo Vizinho Mais Próximo (Nearest Neighbor - NN)

Para encontrar o obstáculo mais próximo de um ponto de consulta $q = (x_q, y_q)$:

1. **Navegação Downward:** Percorre-se a árvore da raiz até a folha correspondente, usando as comparações por eixo ($x_q < x_{\text{nó}}$ ou $y_q < y_{\text{nó}}$).

2. **Estimativa Inicial:** O nó folha alcançado é definido como a "melhor distância atual" $r_{\text{best}}$.

3. **Backtracking (Subida com Poda):** Sobe-se na árvore reavaliando a subárvore oposta. Se a distância perpendicular entre o ponto de consulta $q$ e o plano de corte do nó pai for maior que $r_{\text{best}}$, a subárvore inteira é **podada** (descartada) sem necessidade de visitar seus nós.

### B. Busca por Raio (Radius / Range Search)

Recupera todas as leituras de sensores situadas dentro do raio de segurança $R$ em volta do AGV. A propriedade de partição espacial permite descartar quadrantes inteiros do pátio com uma única comparação de plano de corte.

## 4. Comparativo de Desempenho Computacional

| Operação | Busca Linear (Array/Matriz) | Árvore KD Balanceada | Impacto no Controle do AGV |
| --- | --- | --- | --- |
| **Construção da Estrutura** | $O(1)$ | $O(N \log N)$ | Feita offline no mapa estático ou a cada frame do LiDAR. |
| **Busca pelo Vizinho Mais Próximo** | $O(N)$ | $O(\log N)$ em média | Permite checagens de colisão a 100+ Hz no processador do robô. |
| **Uso de Memória** | $O(N)$ | $O(N)$ | Estrutura enxuta, adequada para hardware embarcado. |

## 5. Aplicação no Ecossistema Visão-AGV

No projeto **Visão-AGV / SCADA-Core**, as Árvores KD são aplicadas diretamente em:

1. **Filtragem de Ruído e Downsampling LiDAR:** Identificação e remoção de pontos dispersos capturados por poeira ou reflexos na fábrica.

2. **Algoritmo ICP (Iterative Closest Point):** Alinhamento da nuvem de pontos em tempo real para estimativa de localização relativa (SLAM) do robô.

3. **Zonas Dinâmicas de Exclusão (Safety Bubble):** Verificação contínua se qualquer leitura de obstáculo penetra o envelope geométrico de segurança do AGV.