# SCADA-Core Automática: Sistema de Controle Visão-AGV
**Disciplina:** ECAA08 - Automática  
**Projeto:** PBL SCADA-Core Automática  

---

## 📌 Sobre o Projeto

Este repositório contém o desenvolvimento do projeto **SCADA-Core Automática**, estruturado para a disciplina **ECAA08**. O objetivo central é desenvolver os motores computacionais de supervisão, controle e diagnóstico para uma planta química automatizada, aplicando rigor matemático (lógica formal, grafos, árvores e relações).

Como cenário prático de aplicação e controle multivariável, o projeto implementa o controle de um **AGV (Automated Guided Vehicle) Logístico** voltado para inspeção e amostragem química. Utilizando Visão Computacional, o AGV opera em um modo *Follow-Me* (Siga-me), onde é capaz de identificar, rastrear e seguir um operador humano pela planta com segurança, mantendo distância referencial e ajustando sua direção automaticamente.

### 🔄 Adaptação e Créditos

Este sistema de controle visual é uma adaptação direta do projeto **Drone Follow-Me com OpenCV**.  
🔗 **Repositório Original:** [LuizFellipiFreire25/Drone-Follow-Me-OpenCV](https://github.com/LuizFellipiFreire25/Drone-Follow-Me-OpenCV)

**O que foi adaptado?**
O algoritmo original gerava sinais de controle Proporcional (P) para os eixos de voo de um drone fictício. Para este PBL industrial, a matriz de controle foi convertida para os atuadores de um AGV terrestre:
* **Eixo X (Antigo "Roll/Yaw" do drone):** Convertido para o controle do **Servo Motor de Esterçamento**, guiando as rodas do AGV para a esquerda ou direita a fim de manter o operador centralizado na câmera.
* **Eixo Z (Antigo "Pitch" do drone):** Convertido para o controle de **Tração (PWM)** do AGV, acelerando ou freando para manter uma distância segura e constante do operador (cálculo de área da *bounding box*).
* **Eixo Y (Antigo "Throttle" do drone):** Convertido para o controle de elevação do **Braço de Amostragem**, permitindo o ajuste de altura para a coleta de reagentes nos tanques.

---

## 📂 Estrutura do Repositório

Seguindo as diretrizes do PBL, o desenvolvimento está dividido e documentado nas seguintes subpastas:

* 📁 `/etapa-01-logica/` - Código do intertravamento, tabelas de verdade e motor de diagnóstico.
* 📁 `/etapa-02-grafos/` - Matrizes da planta, algoritmo de roteamento de fluidos (Dijkstra) e rotas do AGV.
* 📁 `/etapa-03-arvores/` - Busca de tags, hierarquia de mitigação de alarmes e algoritmo de trip (parada segura).
* 📁 `/etapa-04-relacoes/` - Matriz de permissões (Hasse) e sequenciamento de processos (Grafcet/SFC).
* 📄 `AGV_Tracker.py` *(ou nome do seu script principal)* - Código central de Visão Computacional e envio de dados via porta Serial.

---

## 🛠️ Tecnologias Utilizadas

* **Python 3 & OpenCV:** Processamento de imagem e inferência do modelo MobileNet V2.
* **Comunicação Serial:** Integração com hardware (Arduino/CLP).
* **Teoria dos Grafos & Lógica Formal:** Para o roteamento e intertravamento de falhas do SCADA.
* **Git & GitHub:** Versionamento e gestão colaborativa.

---
*Projeto desenvolvido para fins acadêmicos - PBL Automação Industrial*
