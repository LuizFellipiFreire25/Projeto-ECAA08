# Aula 27: Árvores de Decisão (Algoritmos Clássicos) no Diagnóstico Operacional do Visão-AGV

## 1. Contextualização e Motivação no Projeto Visão-AGV

À medida que o sistema **Visão-AGV / SCADA-Core** acumula séries temporais de dados telemétricos (temperatura dos motores elétricos, vibração dos eixos, nível de carga da bateria, escorregamento de rodas e latência da rede sem fio), surge a necessidade de inferir automaticamente o **estado de saúde operacional** do robô e classificar falhas iminentes.

Diferente dos modelos de "caixa-preta" (como redes neurais profundas), as **Árvores de Decisão (Decision Trees)** oferecem um modelo preditivo baseado em regras perfeitamente explicáveis e auditáveis. Isso é essencial em ambientes industriais restritos (ISO 26262 / IEC 61508), onde cada ação corretiva do supervisor deve ser fundamentada em regras lógicas explícitas.

Nesta aula final da Etapa 03, abordamos os algoritmos clássicos de indução de árvores de decisão — como o **ID3 (Iterative Dichotomiser 3)** e o **CART (Classification and Regression Trees)** —, aplicando-os ao diagnóstico preditivo de manutenção e seleção autônoma do modo de condução do AGV.

## 2. Fundamentos Matemáticos e Métricas de Divisão

Um algoritmo de árvore de decisão constrói uma estrutura hierárquica dividindo recursivamente o conjunto de dados $S$ com base no atributo $A$ que oferece a maior **pureza** nas partições resultantes.

### A. Entropia de Shannon e Ganho de Informação (Algoritmo ID3)

A **Entropia** $H(S)$ mede o grau de incerteza ou desordem de um conjunto de amostras $S$ em relação a $C$ classes possíveis:

$$
H(S) = - \sum_{i=1}^{C} p_i \log_2 (p_i)
$$

Onde $p_i$ é a proporção de amostras pertencentes à classe $i$.

O **Ganho de Informação** $IG(S, A)$ quantifica a redução esperada na entropia ao particionar o conjunto $S$ usando o atributo $A$:

$$
IG(S, A) = H(S) - \sum_{v \in \text{Valores}(A)} \frac{|S_v|}{|S|} H(S_v)
$$

O algoritmo ID3 seleciona, em cada nó, o atributo $A$ que maximiza $IG(S, A)$.

### B. Impureza de Gini (Algoritmo CART)

O algoritmo CART utiliza a **Impureza de Gini** $Gini(S)$ como critério de corte binário, apresentando menor custo computacional por não exigir cálculos logarítmicos:

$$
Gini(S) = 1 - \sum_{i=1}^{C} (p_i)^2
$$

O ganho na impureza de Gini para um corte no atributo $A$ é dado por:

$$
\Delta Gini(S, A) = Gini(S) - \left( \frac{|S_{\text{esq}}|}{{|S|}} Gini(S_{\text{esq}}) + \frac{|S_{\text{dir}}|}{{|S|}} Gini(S_{\text{dir}}) \right)
$$

## 3. Aplicação no Diagnóstico do AGV

Considere um conjunto de dados de sensores coletados pelo supervisor SCADA para classificar o **Modo de Operação Recomendado** do AGV em três categorias: `NOMINAL`, `ALERTA_MANUTENCAO` e `PARADA_CRITICA`.

```
                    [ Vibração > 4.5 mm/s? ]
                          /          \
                   ( Sim )            ( Não )
                     /                  \
      [ Temp. Motor > 75°C? ]      [ Bateria < 10%? ]
          /           \                /          \
  (PARADA_CRITICA) (ALERTA)    (RECARGA)      (NOMINAL)

```

### Atributos Preditivos Identificados:

1. **Vibração do Chassi ($mm/s$):** Medida via acelerômetro IMU a bordo.

2. **Temperatura do Motor ($\text{°C}$):** Leitura de RTD/termistor no estator.

3. **Tensão da Bateria ($V$):** Medida via BMS (*Battery Management System*).

4. **Taxa de Perda de Pacotes RF ($\%$):** Qualidade do link de comunicação Wi-Fi/5G.

## 4. Evitando o Sobreajuste (*Overfitting*)

Árvores de decisão não restringidas tendem a memorizar o ruído dos sensores industriais, criando árvores excessivamente profundas que falham ao generalizar em tempo real.

Para mitigar o sobreajuste no controlador embarcado do AGV, aplicamos duas técnicas fundamentais:

* **Pré-Poda (Pre-pruning):** Limitação explícita da profundidade máxima da árvore ($\text{max\_depth}$), definição de um número mínimo de amostras por folha ($\text{min\_samples\_leaf}$) e parada por limiar mínimo de ganho de informação.

* **Pós-Poda (Post-pruning / Cost-Complexity Pruning):** Remoção retroativa de subárvores que não trazem aumento significativo de acurácia na validação cruzada.

## 5. Resumo da Etapa 03 (Árvores) e Integração com a Etapa 04

Com a conclusão da Aula 27, encerramos a **Etapa 03 (Árvores)** do ecossistema **Visão-AGV / SCADA-Core**. Integramos com sucesso:

* **Infraestrutura e Rede:** MST em cabos (Aulas 19 e 23 - Kruskal, Prim, STP/RSTP).

* **Comunicação e Compressão:** Redução do overhead telemétrico via Huffman (Aula 20).

* **Despacho e Decisão:** Priorização por BST (Aula 21) e reatividade via Behavior Trees (Aula 25).

* **Espaço e Percepção:** Navegação RRT contínua (Aula 22), concorrência via Redes de Petri (Aula 24) e processamento LiDAR com KD-Trees (Aula 26).

* **Diagnóstico Inteligente:** Classificação supervisionada via Árvores de Decisão (Aula 27).

Essa sólida base de dados e estruturas em árvore prepara o sistema para as próximas etapas de controle e otimização avançada.