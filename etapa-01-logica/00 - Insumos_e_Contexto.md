# Contexto Industrial e Insumos do Sistema

**Indústria escolhida:** Planta Química de Fertilizantes (Área de Risco, Inspeção e Amostragem)

**Sistema de Automação:** AGV Logístico de Inspeção guiado por Visão Computacional (Modo *Follow-Me*).

**Insumos: Variáveis de Entrada, Sensores e Sinais de Controle (Físicos e Lógicos)**

### Fontes de Navegação e Visão Computacional (Controle de Rota):
* **Fluxo de Vídeo (Câmera Frontal RGB):** Fonte de dados brutos de imagem para a rede neural (MobileNet V2) detectar o operador na área industrial.
* **Coordenadas da Bounding Box ($x, y, w, h$):** Dados geométricos extraídos da imagem para calcular o erro de distância (área da caixa) e o erro de centralização (eixo horizontal).
* **Taxa de Confiança (*Confidence Score*):** Parâmetro de validação gerado pela IA. O sistema exige uma taxa > 50% para confirmar a presença segura do alvo humano.

### Fontes de Atuação e Manipulação (Controle de Eixos):
* **Sinais de Tração (Motor DC - Eixo Z):** Modulação por Largura de Pulso (PWM) que dita a velocidade de aproximação ou afastamento do AGV para manter distância segura.
* **Ângulo de Esterçamento (Servo Motor - Eixo X):** Sinal de direção (0 a 180º) para corrigir desvios de rota caso o operador vire em um corredor.
* **Atuador de Amostragem (Braço Robótico - Eixo Y):** Sinais de elevação e retração do atuador linear para acoplar nas válvulas dos tanques de fertilizantes.

### Fontes de Segurança e Intertravamento (*Safety Inputs*):
* **Sensor de Gás Tóxico (Concentração de $\text{NH}_3$):** Leitura ambiental para ativar a parada de emergência caso o AGV adentre uma área de vazamento.
* **Monitoramento de Bateria (Tensão Analógica):** Sinal de *status* de energia. Bateria abaixo de 10% aciona o intertravamento lógico de recolhimento.
* **Botão de Emergência (E-Stop Físico):** Insumo de hardware de contato Normalmente Fechado (NF) para corte prioritário da energia de todos os atuadores.