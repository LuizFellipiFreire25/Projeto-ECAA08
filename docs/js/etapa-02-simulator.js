/**
 * Visão-AGV / SCADA-Core: Autonomous AGV Topological Navigation & Logistics Simulator
 * Etapa 02: Teoria dos Grafos Aplicada à Navegação Autônoma e Logística Industrial
 * UNIFEI - ECAA08 Automática (2026.2)
 *
 * Implementa:
 * 1. Algoritmo de Dijkstra (Min-Heap) para Roteamento Ótimo na Malha RFID/LiDAR (Aula 14)
 * 2. Desvio Dinâmico de Obstáculos (W -> Infinity), Detecção de Ponte e Trip SIS IEC 61511 (Aula 15)
 * 3. Inspeção Euleriana de Corredores via Algoritmo de Hierholzer + Carteiro Chinês (Aula 16)
 * 4. Despacho Hamiltoniano de Coleta Múltipla (TSP: Nearest Neighbor + Refinamento 2-Opt) (Aula 17)
 * 5. Validação de Precedência e Ordenação Topológica do DAG de Materiais via Algoritmo de Kahn (Aula 18)
 */

(function () {
  'use strict';

  // -------------------------------------------------------------
  // 1. MODELO TOPOLÓGICO: ESTAÇÕES (VÉRTICES) E CORREDORES (ARESTAS)
  // -------------------------------------------------------------

  const NODES = {
    // Camada Principal de Navegação AGV (Setor 300 — Waypoints RFID/LiDAR)
    'ST-01': {
      id: 'ST-01',
      label: 'ST-01 (Base AGV)',
      x: 80,
      y: 145,
      type: 'base-station',
      layer: 'agv',
      tag: 'ST-01',
      desc: 'Recarga BMS & Partida'
    },
    'DOC-101': {
      id: 'DOC-101',
      label: 'DOC-101 (Doca A)',
      x: 230,
      y: 75,
      type: 'warehouse',
      layer: 'agv',
      tag: 'DOC-101',
      desc: 'Recebimento Insumos'
    },
    'ALM-201': {
      id: 'ALM-201',
      label: 'ALM-201 (Almox)',
      x: 370,
      y: 145,
      type: 'warehouse',
      layer: 'agv',
      tag: 'ALM-201',
      desc: 'Triagem Reagentes'
    },
    'AMO-301': {
      id: 'AMO-301',
      label: 'AMO-301 (Lab/Amostra)',
      x: 530,
      y: 145,
      type: 'sampling',
      layer: 'agv',
      tag: 'AMO-301',
      desc: 'Coleta Braço A-301'
    },
    'R-101': {
      id: 'R-101',
      label: 'R-101 (Reator NPK)',
      x: 670,
      y: 75,
      type: 'reactor',
      layer: 'agv',
      tag: 'R-101',
      desc: 'Zona NH3 (AT-201)'
    },
    'DEP-401': {
      id: 'DEP-401',
      label: 'DEP-401 (Depósito B)',
      x: 790,
      y: 145,
      type: 'logistic',
      layer: 'agv',
      tag: 'DEP-401',
      desc: 'Expedição NPK Acabado'
    },

    // Camada Inferior do Fluxo de Processo / Cadeia de Suprimentos DAG (Aula 18)
    'PORT': {
      id: 'PORT',
      label: 'Portaria & Balança',
      x: 110,
      y: 350,
      type: 'logistic',
      layer: 'dag',
      tag: 'PORT',
      desc: 'Recepção e Pesagem'
    },
    'GALP_A': {
      id: 'GALP_A',
      label: 'Galpão A Insumos',
      x: 270,
      y: 350,
      type: 'warehouse',
      layer: 'dag',
      tag: 'GALP_A',
      desc: 'Boxes Ureia, MAP, KCl'
    },
    'MOEGA': {
      id: 'MOEGA',
      label: 'Moega & Dosagem',
      x: 440,
      y: 350,
      type: 'process',
      layer: 'dag',
      tag: 'MOEGA',
      desc: 'Dosagem Gravimétrica'
    },
    'GRAN-201': {
      id: 'GRAN-201',
      label: 'Granulação & Secagem',
      x: 610,
      y: 350,
      type: 'process',
      layer: 'dag',
      tag: 'GRAN-201',
      desc: 'Tambor Rotativo NPK'
    },
    'DOCAS': {
      id: 'DOCAS',
      label: 'Docas Expedição',
      x: 780,
      y: 350,
      type: 'logistic',
      layer: 'dag',
      tag: 'DOCAS',
      desc: 'Carregamento Caminhões'
    }
  };

  // Arestas Dirigidas da Malha de Navegação do AGV (Corredores RFID/LiDAR)
  const AGV_EDGES = [
    { id: 'e1', u: 'ST-01', v: 'DOC-101', weight: 10, tag: 'TAG-01', status: 'normal', bridge: false },
    { id: 'e2', u: 'ST-01', v: 'ALM-201', weight: 12, tag: 'TAG-02', status: 'normal', bridge: false },
    { id: 'e3', u: 'DOC-101', v: 'ALM-201', weight: 15, tag: 'TAG-03', status: 'normal', bridge: false },
    { id: 'e4', u: 'ALM-201', v: 'AMO-301', weight: 20, tag: 'TAG-04', status: 'normal', bridge: true }, // Ponte Crítica (Tarjan)
    { id: 'e5', u: 'AMO-301', v: 'R-101', weight: 18, tag: 'TAG-05', status: 'normal', bridge: false },
    { id: 'e6', u: 'AMO-301', v: 'DEP-401', weight: 14, tag: 'TAG-06', status: 'normal', bridge: false },
    { id: 'e7', u: 'R-101', v: 'DEP-401', weight: 25, tag: 'TAG-07', status: 'normal', bridge: false },
    { id: 'e8', u: 'DEP-401', v: 'ST-01', weight: 30, tag: 'TAG-08', status: 'normal', bridge: false, curved: true }
  ];

  // Arestas do Fluxo Linear Inferior (Corredor Logístico / DAG de Suprimentos)
  const DAG_FLOW_EDGES = [
    { id: 'd1', u: 'PORT', v: 'GALP_A', weight: 40, label: 'Recebimento Bruto' },
    { id: 'd2', u: 'GALP_A', v: 'MOEGA', weight: 35, label: 'Alimentação Silos' },
    { id: 'd3', u: 'MOEGA', v: 'GRAN-201', weight: 45, label: 'Reação & Granulação' },
    { id: 'd4', u: 'GRAN-201', v: 'DOCAS', weight: 40, label: 'Ensaque & Expedição' }
  ];

  // Precedência Completa do DAG Multicamada (Aula 18 - Algoritmo de Kahn)
  const MATERIAL_DAG = [
    { u: 'PORT', v: 'GALP_A', label: 'Descarga de Matérias-Primas na Balança' },
    { u: 'GALP_A', v: 'ALM-201', label: 'Triagem de Reagentes e Insumos Químicos' },
    { u: 'ALM-201', v: 'MOEGA', label: 'Abastecimento dos Silos e Moega Dosadora' },
    { u: 'MOEGA', v: 'R-101', label: 'Dosagem Gravimétrica para Neutralização NPK' },
    { u: 'R-101', v: 'AMO-301', label: 'Coleta de Slurry pelo Braço Robótico A-301' },
    { u: 'AMO-301', v: 'GRAN-201', label: 'Laudo Laboratorial Aprovado para Granulação' },
    { u: 'GRAN-201', v: 'DEP-401', label: 'Transferência de Lotes NPK Ensacados' },
    { u: 'DEP-401', v: 'DOCAS', label: 'Ordem de Embarque Rodoviário Finalizada' }
  ];

  // Matriz Canônica de Distâncias Simétricas para o TSP (Aula 17: NN = 155.62m -> 2-Opt = 135.62m)
  const TSP_DIST_MATRIX = {
    'ST-01':   { 'ST-01': 0,     'DOC-101': 10.0,  'ALM-201': 12.0,  'AMO-301': 32.0,  'R-101': 71.62, 'DEP-401': 47.62 },
    'DOC-101': { 'ST-01': 10.0,  'DOC-101': 0,     'ALM-201': 15.0,  'AMO-301': 35.0,  'R-101': 55.0,  'DEP-401': 65.0  },
    'ALM-201': { 'ST-01': 12.0,  'DOC-101': 15.0,  'ALM-201': 0,     'AMO-301': 20.0,  'R-101': 38.0,  'DEP-401': 34.0  },
    'AMO-301': { 'ST-01': 32.0,  'DOC-101': 35.0,  'ALM-201': 20.0,  'AMO-301': 0,     'R-101': 18.0,  'DEP-401': 14.0  },
    'R-101':   { 'ST-01': 71.62, 'DOC-101': 55.0,  'ALM-201': 38.0,  'AMO-301': 18.0,  'R-101': 0,     'DEP-401': 25.0  },
    'DEP-401': { 'ST-01': 47.62, 'DOC-101': 65.0,  'ALM-201': 34.0,  'AMO-301': 14.0,  'R-101': 25.0,  'DEP-401': 0     }
  };

  // -------------------------------------------------------------
  // 2. GERENCIADOR DE ESTADO DO SIMULADOR (SCADA STATE)
  // -------------------------------------------------------------

  const simState = {
    activeMode: 'dijkstra', // 'dijkstra', 'leak', 'euler', 'hamilton', 'dag'
    selectedSource: 'ST-01',
    selectedTarget: 'DEP-401',
    blockedEdges: new Set(),
    activeRoute: [],
    highlightedEdges: [],
    eulerDuplicatedEdges: [],
    animating: false,
    animTimer: null,
    agvPosition: { x: 80, y: 145 },
    corridors: {
      'TAG-01': 'LIVRE',
      'TAG-02': 'LIVRE',
      'TAG-03': 'LIVRE',
      'TAG-04': 'LIVRE',
      'TAG-05': 'LIVRE',
      'TAG-06': 'LIVRE',
      'TAG-07': 'LIVRE',
      'TAG-08': 'LIVRE'
    },
    devices: {
      'CAM-101 (Follow-Me)': 'LOCK-OK',
      'CAM-102 (BBox)': 'LIVRE',
      'AT-201 (NH3)': '8 ppm (OK)',
      'BT-201 (BMS)': '94% (25.2V)',
      'M-301 (Tração)': 'STANDBY',
      'Servo-X (Direção)': '0° (RETO)',
      'A-301 (Braço)': 'RETRAÍDO',
      'ALM-301 (Sirene)': 'SILENTE'
    },
    kpi: {
      distance: 0,
      decisionTimeMs: 0,
      statusMessage: 'Sistema Visão-AGV em prontidão operacional na base ST-01. Selecione um cenário ou clique nos corredores.',
      statusLevel: 'info' // 'info', 'success', 'warning', 'danger'
    }
  };

  // -------------------------------------------------------------
  // 3. ALGORITMOS FUNDAMENTAIS DE TEORIA DOS GRAFOS
  // -------------------------------------------------------------

  /**
   * Algoritmo de Dijkstra para Caminho Mínimo na Malha do AGV (Aulas 14 e 15)
   * Repondera corredores interditados/obstáculos com W(u,v) = Infinity.
   */
  function runDijkstra(sourceId, targetId) {
    const t0 = performance.now();
    const agvNodeIds = ['ST-01', 'DOC-101', 'ALM-201', 'AMO-301', 'R-101', 'DEP-401'];
    const dist = {};
    const prev = {};
    const visited = new Set();
    const unvisited = [];

    agvNodeIds.forEach(id => {
      dist[id] = Infinity;
      prev[id] = null;
      unvisited.push(id);
    });

    if (!dist.hasOwnProperty(sourceId)) {
      dist[sourceId] = Infinity;
      unvisited.push(sourceId);
    }
    dist[sourceId] = 0;

    // Lista de adjacência ponderada
    const adj = {};
    agvNodeIds.forEach(id => { adj[id] = []; });
    AGV_EDGES.forEach(edge => {
      const isBlocked = (edge.status === 'blocked') || simState.blockedEdges.has(edge.id);
      const w = isBlocked ? Infinity : edge.weight;
      if (adj[edge.u]) {
        adj[edge.u].push({ v: edge.v, weight: w, edgeId: edge.id, tag: edge.tag });
      }
    });

    while (unvisited.length > 0) {
      unvisited.sort((a, b) => dist[a] - dist[b]);
      const u = unvisited.shift();

      if (dist[u] === Infinity) break;
      if (u === targetId) break;

      visited.add(u);

      const neighbors = adj[u] || [];
      for (const edge of neighbors) {
        if (visited.has(edge.v) || edge.weight === Infinity) continue;
        const alt = dist[u] + edge.weight;
        if (alt < dist[edge.v]) {
          dist[edge.v] = alt;
          prev[edge.v] = { u, edgeId: edge.edgeId, tag: edge.tag };
        }
      }
    }

    const t1 = performance.now();
    const decisionTimeMs = Math.max(0.04, Math.round((t1 - t0) * 1000) / 1000);

    const pathNodes = [];
    const pathEdges = [];
    let curr = targetId;
    if (dist[targetId] !== Infinity) {
      while (curr) {
        pathNodes.unshift(curr);
        const p = prev[curr];
        if (p) {
          pathEdges.unshift(p.edgeId);
          curr = p.u;
        } else {
          curr = null;
        }
      }
    }

    return {
      success: dist[targetId] !== Infinity,
      distance: dist[targetId],
      pathNodes,
      pathEdges,
      decisionTimeMs
    };
  }

  /**
   * Algoritmo de Hierholzer + Eulerização do Carteiro Chinês (Aula 16)
   * Audita os 4 vértices de grau ímpar (ST-01, ALM-201, AMO-301, DEP-401),
   * duplica os corredores de menor peso (TAG-02: 12m e TAG-06: 14m) e extrai o circuito euleriano de 170m.
   */
  function runHierholzer() {
    const t0 = performance.now();
    const adj = {};
    const agvNodeIds = ['ST-01', 'DOC-101', 'ALM-201', 'AMO-301', 'R-101', 'DEP-401'];
    agvNodeIds.forEach(id => { adj[id] = []; });

    // Grafo não-dirigido base dos corredores para varredura física de piso
    AGV_EDGES.forEach(e => {
      const edgeObj = { id: e.id, u: e.u, v: e.v, weight: e.weight, used: false };
      adj[e.u].push(edgeObj);
      adj[e.v].push(edgeObj);
    });

    // Identifica nós de grau ímpar antes da eulerização
    const oddVertices = agvNodeIds.filter(v => adj[v].length % 2 !== 0);

    // Eulerização via Problema do Carteiro Chinês (duplica e2: ST-01<->ALM-201 [12m] e e6: AMO-301<->DEP-401 [14m])
    const cppPairs = [
      { id: 'e2_cpp', baseId: 'e2', u: 'ST-01', v: 'ALM-201', weight: 12, used: false },
      { id: 'e6_cpp', baseId: 'e6', u: 'AMO-301', v: 'DEP-401', weight: 14, used: false }
    ];
    cppPairs.forEach(dup => {
      adj[dup.u].push(dup);
      adj[dup.v].push(dup);
    });

    const stack = ['ST-01'];
    const circuit = [];
    const usedEdgeIds = [];

    while (stack.length > 0) {
      const u = stack[stack.length - 1];
      const nextEdge = (adj[u] || []).find(e => !e.used);
      if (nextEdge) {
        nextEdge.used = true;
        const nextVertex = (nextEdge.u === u) ? nextEdge.v : nextEdge.u;
        stack.push(nextVertex);
        usedEdgeIds.push(nextEdge.baseId || nextEdge.id);
      } else {
        circuit.push(stack.pop());
      }
    }

    circuit.reverse();
    const baseWeight = AGV_EDGES.reduce((acc, e) => acc + e.weight, 0); // 144m
    const cppExtraWeight = 12 + 14; // 26m (TAG-02 + TAG-06)
    const totalDistance = baseWeight + cppExtraWeight; // 170m
    const t1 = performance.now();

    return {
      circuit,
      edgeSequence: AGV_EDGES.map(e => e.id),
      duplicatedEdges: ['e2', 'e6'],
      oddVertices,
      baseWeight,
      cppExtraWeight,
      totalDistance,
      decisionTimeMs: Math.max(0.06, Math.round((t1 - t0) * 1000) / 1000)
    };
  }

  /**
   * Problema do Caixeiro-Viajante (TSP) para Coleta Múltipla do AGV (Aula 17)
   * Heurística Construtiva Nearest Neighbor (155.62m) + Busca Local 2-Opt (135.62m)
   */
  function runTSP() {
    const t0 = performance.now();
    const targets = ['ST-01', 'DOC-101', 'ALM-201', 'AMO-301', 'R-101', 'DEP-401'];
    const n = targets.length;

    function dist(u, v) {
      return (TSP_DIST_MATRIX[u] && TSP_DIST_MATRIX[u][v] !== undefined) ? TSP_DIST_MATRIX[u][v] : Infinity;
    }

    function calcTourDist(tour) {
      let total = 0;
      for (let i = 0; i < tour.length - 1; i++) {
        total += dist(tour[i], tour[i + 1]);
      }
      return Math.round(total * 100) / 100;
    }

    // 1. Nearest Neighbor partindo de ST-01
    // Em AMO-301, escolhe DEP-401 (14m) antes de R-101 (18m) -> gera cruzamento (155.62m)
    const visited = new Set(['ST-01']);
    let current = 'ST-01';
    const nnTour = ['ST-01'];

    while (visited.size < n) {
      let nearest = null;
      let minDist = Infinity;
      targets.forEach(candidate => {
        if (!visited.has(candidate)) {
          const d = dist(current, candidate);
          if (d < minDist) {
            minDist = d;
            nearest = candidate;
          }
        }
      });
      if (nearest) {
        nnTour.push(nearest);
        visited.add(nearest);
        current = nearest;
      }
    }
    nnTour.push('ST-01');
    const nnCost = calcTourDist(nnTour); // 155.62 m

    // 2. Otimização Local 2-Opt (desfaz o cruzamento invertendo [DEP-401, R-101] -> [R-101, DEP-401])
    let bestTour = [...nnTour];
    let improved = true;

    while (improved) {
      improved = false;
      for (let i = 1; i < n - 1; i++) {
        for (let k = i + 1; k < n; k++) {
          const candidateTour = [
            ...bestTour.slice(0, i),
            ...bestTour.slice(i, k + 1).reverse(),
            ...bestTour.slice(k + 1)
          ];
          if (calcTourDist(candidateTour) + 1e-6 < calcTourDist(bestTour)) {
            bestTour = candidateTour;
            improved = true;
          }
        }
      }
    }

    const optCost = calcTourDist(bestTour); // 135.62 m
    const savingsMeters = Math.round((nnCost - optCost) * 10) / 10; // 20.0 m
    const improvementPct = Math.round(((nnCost - optCost) / nnCost) * 100); // 13% (12.85%)
    const t1 = performance.now();

    return {
      nnTour,
      tour: bestTour,
      nnCost: Math.round(nnCost * 10) / 10,
      optCost: Math.round(optCost * 10) / 10,
      savingsMeters,
      improvementPct,
      decisionTimeMs: Math.max(0.08, Math.round((t1 - t0) * 1000) / 1000)
    };
  }

  /**
   * Algoritmo de Kahn para Ordenação Topológica do DAG de Materiais (Aula 18)
   */
  function runKahn() {
    const t0 = performance.now();
    const inDegree = {};
    const adj = {};
    const allNodes = [];

    MATERIAL_DAG.forEach(edge => {
      if (!allNodes.includes(edge.u)) allNodes.push(edge.u);
      if (!allNodes.includes(edge.v)) allNodes.push(edge.v);
      if (!adj[edge.u]) adj[edge.u] = [];
      adj[edge.u].push(edge.v);
      inDegree[edge.v] = (inDegree[edge.v] || 0) + 1;
      if (inDegree[edge.u] === undefined) inDegree[edge.u] = 0;
    });

    const queue = [];
    allNodes.forEach(node => {
      if (inDegree[node] === 0) queue.push(node);
    });

    const topoOrder = [];
    while (queue.length > 0) {
      const u = queue.shift();
      topoOrder.push(u);
      (adj[u] || []).forEach(v => {
        inDegree[v]--;
        if (inDegree[v] === 0) queue.push(v);
      });
    }

    const isDAG = topoOrder.length === allNodes.length;
    const t1 = performance.now();

    return {
      isDAG,
      topoOrder,
      steps: MATERIAL_DAG,
      decisionTimeMs: Math.max(0.05, Math.round((t1 - t0) * 1000) / 1000)
    };
  }

  // -------------------------------------------------------------
  // 4. RENDERIZADOR SINÓTICO SVG INTERATIVO
  // -------------------------------------------------------------

  function renderSynoptic() {
    const svg = document.getElementById('scada-graph-svg');
    if (!svg) return;

    let svgHtml = '';

    // Definições: Setas Dirigidas, Gradientes e Filtro Glow
    svgHtml += `
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="25" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
        </marker>
        <marker id="arrow-active" viewBox="0 0 10 10" refX="25" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
        </marker>
        <marker id="arrow-euler" viewBox="0 0 10 10" refX="25" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#c084fc" />
        </marker>
        <marker id="arrow-tsp" viewBox="0 0 10 10" refX="25" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
        </marker>
        <marker id="arrow-leak" viewBox="0 0 10 10" refX="25" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444" />
        </marker>
        <linearGradient id="stationGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#1e3a8a" />
          <stop offset="100%" stop-color="#0f172a" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    `;

    // 1. Quadros de Fundo das Duas Camadas Topológicas
    svgHtml += `
      <rect x="20" y="20" width="840" height="262" rx="10" fill="#071022" stroke="#1e3a5f" stroke-width="1.5" />
      <text x="35" y="40" fill="#38bdf8" font-size="10" font-family="monospace" font-weight="bold">
        CAMADA DE NAVEGAÇÃO TOPOLÓGICA DO VISÃO-AGV (WAYPOINTS RFID/LiDAR • CORREDORES TAG-01 A TAG-08)
      </text>

      <rect x="20" y="295" width="840" height="115" rx="10" fill="#0b1528" stroke="#1e3a5f" stroke-width="1.5" />
      <text x="35" y="314" fill="#94a3b8" font-size="10" font-family="monospace" font-weight="bold">
        CADEIA DE SUPRIMENTOS & FLUXO DE TRANSFORMAÇÃO DE MATERIAIS (DAG MULTICAMADA • AULA 18)
      </text>
    `;

    // 2. Desenha Arestas do Fluxo Inferior (DAG)
    DAG_FLOW_EDGES.forEach(de => {
      const u = NODES[de.u];
      const v = NODES[de.v];
      const isDagActive = (simState.activeMode === 'dag');
      const strokeColor = isDagActive ? '#10b981' : '#334155';
      const strokeWidth = isDagActive ? 3.5 : 2;
      const strokeDash = isDagActive ? 'none' : '5,4';
      const marker = isDagActive ? 'marker-end="url(#arrow-active)"' : '';

      svgHtml += `
        <line x1="${u.x}" y1="${u.y}" x2="${v.x}" y2="${v.y}"
              stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-dasharray="${strokeDash}" ${marker} />
        <text x="${(u.x + v.x) / 2}" y="${u.y - 10}" fill="#64748b" font-size="7.5" font-family="monospace" text-anchor="middle">${de.label}</text>
      `;
    });

    // Se modo DAG estiver ativo, desenha acoplamentos intercamada (G_M <-> G_V)
    if (simState.activeMode === 'dag') {
      const crossLinks = [
        ['GALP_A', 'ALM-201'],
        ['ALM-201', 'MOEGA'],
        ['MOEGA', 'R-101'],
        ['R-101', 'AMO-301'],
        ['AMO-301', 'GRAN-201'],
        ['GRAN-201', 'DEP-401'],
        ['DEP-401', 'DOCAS']
      ];
      crossLinks.forEach(([uId, vId]) => {
        const u = NODES[uId];
        const v = NODES[vId];
        svgHtml += `
          <line x1="${u.x}" y1="${u.y}" x2="${v.x}" y2="${v.y}"
                stroke="#10b981" stroke-width="2" stroke-dasharray="4,4" opacity="0.75" marker-end="url(#arrow-active)" />
        `;
      });
    }

    // 3. Desenha Arestas Dirigidas da Malha do AGV (TAG-01 a TAG-08)
    AGV_EDGES.forEach(edge => {
      const u = NODES[edge.u];
      const v = NODES[edge.v];
      const isRoute = simState.highlightedEdges.includes(edge.id);
      const isBlocked = (edge.status === 'blocked') || simState.blockedEdges.has(edge.id);
      const isEulerDup = (simState.activeMode === 'euler') && simState.eulerDuplicatedEdges.includes(edge.id);

      let stroke = '#1d4ed8';
      let strokeWidth = 3;
      let marker = 'url(#arrow)';
      let filter = '';
      let dasharray = 'none';

      if (isBlocked) {
        stroke = '#ef4444';
        strokeWidth = 5;
        marker = 'url(#arrow-leak)';
        dasharray = '6,3';
        filter = 'filter="url(#glow)"';
      } else if (isRoute) {
        if (simState.activeMode === 'euler') {
          stroke = isEulerDup ? '#f472b6' : '#c084fc';
          strokeWidth = isEulerDup ? 5.5 : 4.5;
          marker = 'url(#arrow-euler)';
        } else if (simState.activeMode === 'hamilton') {
          stroke = '#f59e0b';
          strokeWidth = 5;
          marker = 'url(#arrow-tsp)';
        } else {
          stroke = '#10b981';
          strokeWidth = 5;
          marker = 'url(#arrow-active)';
        }
        filter = 'filter="url(#glow)"';
      }

      let mx, my;
      if (edge.curved) {
        // Arco curvo inferior para e8 (DEP-401 -> ST-01, 30m) evitando cruzar nós intermediários
        svgHtml += `
          <path id="svg-edge-${edge.id}" d="M 790 170 Q 435 265 80 170"
                fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-dasharray="${dasharray}"
                marker-end="${marker}" ${filter} class="corridor-line" data-edge="${edge.id}" style="cursor: pointer;" />
        `;
        mx = 435;
        my = 218;
      } else {
        svgHtml += `
          <line id="svg-edge-${edge.id}" x1="${u.x}" y1="${u.y}" x2="${v.x}" y2="${v.y}"
                stroke="${stroke}" stroke-width="${strokeWidth}" stroke-dasharray="${dasharray}"
                marker-end="${marker}" ${filter} class="corridor-line" data-edge="${edge.id}" style="cursor: pointer;" />
        `;
        mx = (u.x + v.x) / 2;
        my = (u.y + v.y) / 2;
      }

      // Etiqueta da TAG do Corredor e Distância em Metros
      const corridorState = simState.corridors[edge.tag] || 'LIVRE';
      let badgeFill = '#1e293b';
      let badgeBorder = '#475569';
      if (isBlocked) {
        badgeFill = '#ef4444';
        badgeBorder = '#fecaca';
      } else if (corridorState === 'ATIVO' || isRoute) {
        badgeFill = simState.activeMode === 'euler' ? '#9333ea' : (simState.activeMode === 'hamilton' ? '#d97706' : '#059669');
        badgeBorder = '#ffffff';
      } else if (edge.bridge) {
        badgeFill = '#1e3a8a';
        badgeBorder = '#38bdf8';
      }

      const tagLabel = edge.bridge ? `${edge.tag} [PONTE]` : edge.tag;
      const badgeWidth = edge.bridge ? 74 : 46;

      svgHtml += `
        <g class="corridor-line" data-edge="${edge.id}" transform="translate(${mx}, ${my})" style="cursor: pointer;">
          <rect x="${-badgeWidth / 2}" y="-9" width="${badgeWidth}" height="17" rx="4" fill="${badgeFill}" stroke="${badgeBorder}" stroke-width="1.2" />
          <text y="3" fill="#ffffff" font-size="7.5" font-family="monospace" text-anchor="middle" font-weight="bold">${tagLabel}</text>
          <text y="-12" fill="#e2e8f0" font-size="8.5" font-family="monospace" text-anchor="middle" font-weight="bold">${edge.weight}m${isEulerDup ? ' (2x CPP)' : ''}</text>
        </g>
      `;

      // Alerta visual de Obstáculo / Interdição no Corredor
      if (isBlocked) {
        const alertText = edge.bridge ? '🛑 PONTE BLOQUEADA (TRIP)' : '⚠️ OBSTÁCULO (W=∞)';
        const alertW = edge.bridge ? 132 : 106;
        svgHtml += `
          <g transform="translate(${mx}, ${my - 28})">
            <rect x="${-alertW / 2}" y="-10" width="${alertW}" height="18" rx="4" fill="#dc2626" stroke="#ffffff" stroke-width="1.2" />
            <text y="3" fill="#ffffff" font-size="7.8" font-family="monospace" text-anchor="middle" font-weight="bold">${alertText}</text>
          </g>
        `;
      }
    });

    // 4. Desenha as Estações / Waypoints (Nós do Grafo)
    Object.values(NODES).forEach(node => {
      const isSelectedSource = (simState.selectedSource === node.id);
      const isSelectedTarget = (simState.selectedTarget === node.id);
      const isInRoute = simState.activeRoute.includes(node.id);

      let stroke = '#38bdf8';
      let strokeWidth = 2;

      if (isSelectedSource) {
        stroke = '#38bdf8';
        strokeWidth = 4;
      } else if (isSelectedTarget) {
        stroke = '#10b981';
        strokeWidth = 4;
      } else if (isInRoute) {
        stroke = simState.activeMode === 'hamilton' ? '#f59e0b' : (simState.activeMode === 'euler' ? '#c084fc' : '#34d399');
        strokeWidth = 3;
      }

      if (node.type === 'base-station') {
        svgHtml += `
          <g class="graph-node" data-id="${node.id}" style="cursor: pointer;">
            <rect x="${node.x - 42}" y="${node.y - 26}" width="84" height="52" rx="9"
                  fill="url(#stationGrad)" stroke="${stroke}" stroke-width="${strokeWidth}" />
            <text x="${node.x}" y="${node.y - 6}" fill="#ffffff" font-size="9.5" font-family="monospace" font-weight="bold" text-anchor="middle">⚡ ${node.id}</text>
            <text x="${node.x}" y="${node.y + 8}" fill="#67e8f9" font-size="7.5" font-family="monospace" text-anchor="middle">Base & BMS</text>
            <text x="${node.x}" y="${node.y + 19}" fill="#94a3b8" font-size="6.8" font-family="monospace" text-anchor="middle">deg⁻=1 | deg⁺=2</text>
          </g>
        `;
      } else if (node.type === 'sampling') {
        svgHtml += `
          <g class="graph-node" data-id="${node.id}" style="cursor: pointer;">
            <rect x="${node.x - 44}" y="${node.y - 26}" width="88" height="52" rx="9"
                  fill="#172554" stroke="${stroke}" stroke-width="${strokeWidth}" />
            <text x="${node.x}" y="${node.y - 6}" fill="#ffffff" font-size="9.5" font-family="monospace" font-weight="bold" text-anchor="middle">🦾 ${node.id}</text>
            <text x="${node.x}" y="${node.y + 8}" fill="#fde68a" font-size="7.5" font-family="monospace" text-anchor="middle">Braço A-301</text>
            <text x="${node.x}" y="${node.y + 19}" fill="#94a3b8" font-size="6.8" font-family="monospace" text-anchor="middle">Articulação</text>
          </g>
        `;
      } else if (node.type === 'reactor') {
        svgHtml += `
          <g class="graph-node" data-id="${node.id}" style="cursor: pointer;">
            <rect x="${node.x - 42}" y="${node.y - 27}" width="84" height="54" rx="12"
                  fill="#0c2340" stroke="${stroke}" stroke-width="${strokeWidth}" />
            <text x="${node.x}" y="${node.y - 6}" fill="#ffffff" font-size="9.5" font-family="monospace" font-weight="bold" text-anchor="middle">⚗️ ${node.id}</text>
            <text x="${node.x}" y="${node.y + 8}" fill="#38bdf8" font-size="7.5" font-family="monospace" text-anchor="middle">Reator NPK</text>
            <text x="${node.x}" y="${node.y + 19}" fill="#fca5a5" font-size="6.8" font-family="monospace" text-anchor="middle">Sensor AT-201</text>
          </g>
        `;
      } else if (node.layer === 'agv') {
        svgHtml += `
          <g class="graph-node" data-id="${node.id}" style="cursor: pointer;">
            <rect x="${node.x - 42}" y="${node.y - 25}" width="84" height="50" rx="7"
                  fill="#111c35" stroke="${stroke}" stroke-width="${strokeWidth}" />
            <text x="${node.x}" y="${node.y - 5}" fill="#ffffff" font-size="9.5" font-family="monospace" font-weight="bold" text-anchor="middle">${node.id}</text>
            <text x="${node.x}" y="${node.y + 9}" fill="#94a3b8" font-size="7.5" font-family="monospace" text-anchor="middle">${node.desc}</text>
            <text x="${node.x}" y="${node.y + 19}" fill="#64748b" font-size="6.8" font-family="monospace" text-anchor="middle">${node.id === 'ALM-201' ? 'Articulação' : 'Waypoint RFID'}</text>
          </g>
        `;
      } else {
        // Nós da camada inferior (Cadeia de Suprimentos DAG)
        const w = 112;
        const h = 44;
        svgHtml += `
          <g class="graph-node" data-id="${node.id}" style="cursor: pointer;">
            <rect x="${node.x - w / 2}" y="${node.y - h / 2}" width="${w}" height="${h}" rx="6"
                  fill="#0f172a" stroke="${stroke}" stroke-width="${strokeWidth}" />
            <text x="${node.x}" y="${node.y - 3}" fill="#ffffff" font-size="8.5" font-family="monospace" font-weight="bold" text-anchor="middle">${node.id}</text>
            <text x="${node.x}" y="${node.y + 11}" fill="#94a3b8" font-size="7.2" font-family="monospace" text-anchor="middle">${node.label}</text>
          </g>
        `;
      }
    });

    // 5. Desenha o Token Móvel do Veículo Autônomo (Visão-AGV)
    if (simState.agvPosition) {
      const isAlarm = simState.devices['ALM-301 (Sirene)'] === 'ALARME';
      const ringColor = isAlarm ? '#ef4444' : '#f59e0b';
      svgHtml += `
        <g transform="translate(${simState.agvPosition.x}, ${simState.agvPosition.y - 34})" filter="url(#glow)">
          <circle r="13" fill="${ringColor}" stroke="#ffffff" stroke-width="2" />
          <text y="4" fill="#000000" font-size="11" text-anchor="middle">🤖</text>
        </g>
      `;
    }

    svg.innerHTML = svgHtml;

    // Eventos de clique nos Waypoints / Estações
    svg.querySelectorAll('.graph-node').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-id');
        handleNodeClick(id);
      });
    });

    // Eventos de clique nos Corredores (TAG-01 a TAG-08)
    svg.querySelectorAll('.corridor-line').forEach(el => {
      el.addEventListener('click', () => {
        const edgeId = el.getAttribute('data-edge');
        handleCorridorClick(edgeId);
      });
    });
  }

  // -------------------------------------------------------------
  // 5. CONTROLADORES DE CENÁRIOS E EVENTOS DO SUPERVISÓRIO
  // -------------------------------------------------------------

  function syncCorridorTags(activeEdgeIds = []) {
    AGV_EDGES.forEach(edge => {
      const isBlocked = (edge.status === 'blocked') || simState.blockedEdges.has(edge.id);
      if (isBlocked) {
        simState.corridors[edge.tag] = 'BLOQUEADO';
      } else if (activeEdgeIds.includes(edge.id)) {
        simState.corridors[edge.tag] = 'ATIVO';
      } else {
        simState.corridors[edge.tag] = 'LIVRE';
      }
    });
  }

  function clearAllBlocks() {
    AGV_EDGES.forEach(e => { e.status = 'normal'; });
    simState.blockedEdges.clear();
    simState.eulerDuplicatedEdges = [];
  }

  function handleNodeClick(nodeId) {
    const node = NODES[nodeId];
    if (!node) return;

    if (node.layer === 'dag') {
      logConsole(`📦 Estação de Processo [${nodeId} - ${node.label}]: Executando auditoria topológica de Kahn...`);
      executeDAGFlow();
      return;
    }

    simState.activeMode = simState.blockedEdges.size > 0 ? 'leak' : 'dijkstra';
    if (!simState.selectedSource || (simState.selectedSource && simState.selectedTarget)) {
      simState.selectedSource = nodeId;
      simState.selectedTarget = null;
      simState.agvPosition = { x: node.x, y: node.y };
      logConsole(`📍 Waypoint de partida selecionado: ${nodeId} (${node.desc}). Clique na estação de destino.`);
      updateUI();
    } else {
      if (nodeId === simState.selectedSource) {
        logConsole(`ℹ️ Destino igual à origem (${nodeId}). Selecione outra estação da malha AGV.`);
        return;
      }
      simState.selectedTarget = nodeId;
      logConsole(`🎯 Waypoint de destino selecionado: ${nodeId}. Calculando menor rota via Dijkstra...`);
      executeDijkstraRouting();
    }
  }

  function handleCorridorClick(edgeId) {
    const edge = AGV_EDGES.find(e => e.id === edgeId);
    if (!edge) return;

    if (edge.status === 'blocked' || simState.blockedEdges.has(edge.id)) {
      edge.status = 'normal';
      simState.blockedEdges.delete(edge.id);
      logConsole(`🟢 Corredor ${edge.tag} (${edge.u} ➔ ${edge.v}) liberado pela visão computacional CAM-102.`);
    } else {
      edge.status = 'blocked';
      simState.blockedEdges.add(edge.id);
      if (edge.bridge) {
        logConsole(`🛑 ALERTA CRÍTICO: Obstáculo detectado na PONTE ESTRUTURAL ${edge.tag} (${edge.u} ➔ ${edge.v})! W(${edge.tag}) ➔ ∞.`);
      } else {
        logConsole(`🚨 OBSTÁCULO DETECTADO por CAM-102 no corredor ${edge.tag} (${edge.u} ➔ ${edge.v})! Reponderando W(${edge.tag}) ➔ ∞.`);
      }
    }

    simState.activeMode = simState.blockedEdges.size > 0 ? 'leak' : 'dijkstra';
    executeDijkstraRouting();
  }

  function executeDijkstraRouting() {
    const src = simState.selectedSource || 'ST-01';
    const tgt = simState.selectedTarget || 'DEP-401';
    simState.eulerDuplicatedEdges = [];

    const result = runDijkstra(src, tgt);
    syncCorridorTags(result.pathEdges);

    if (result.success) {
      simState.activeRoute = result.pathNodes;
      simState.highlightedEdges = result.pathEdges;
      simState.kpi.distance = result.distance;
      simState.kpi.decisionTimeMs = result.decisionTimeMs;

      const hasObstacle = simState.blockedEdges.size > 0;
      const passesReactor = result.pathNodes.includes('R-101');
      const passesDock = result.pathNodes.includes('DOC-101');

      // Atualiza telemetria dos sensores e atuadores embarcados do Visão-AGV
      simState.devices['CAM-101 (Follow-Me)'] = 'LOCK-OK (1.5m)';
      simState.devices['CAM-102 (BBox)'] = hasObstacle ? 'OBSTÁCULO (d1=1)' : 'LIVRE (d1=0)';
      simState.devices['AT-201 (NH3)'] = passesReactor ? '18 ppm (MONIT.)' : '8 ppm (OK)';
      simState.devices['BT-201 (BMS)'] = result.distance > 60 ? '89% (24.8V)' : '93% (25.1V)';
      simState.devices['M-301 (Tração)'] = 'ON (1.2 m/s)';
      simState.devices['Servo-X (Direção)'] = passesReactor ? '+28° (DESVIO R-101)' : (passesDock ? '-24° (DESVIO DOC-101)' : '0° (NOMINAL)');
      simState.devices['A-301 (Braço)'] = 'RETRAÍDO (a1=0)';
      simState.devices['ALM-301 (Sirene)'] = hasObstacle ? 'BIP AVISO' : 'SILENTE';

      if (hasObstacle) {
        const blockedTags = Array.from(simState.blockedEdges).map(id => {
          const e = AGV_EDGES.find(x => x.id === id);
          return e ? e.tag : id;
        }).join(', ');
        simState.kpi.statusMessage = `🛡️ Desvio Dinâmico Ativo (${blockedTags} ➔ ∞): Rota recalculada em ${result.decisionTimeMs}ms com ${result.distance}m (${result.pathNodes.join(' ➔ ')}).`;
        simState.kpi.statusLevel = 'warning';
        logConsole(`🔄 Recálculo Dijkstra concluído em ${result.decisionTimeMs}ms: ${result.pathNodes.join(' ➔ ')} (${result.distance}m).`);
      } else {
        simState.kpi.statusMessage = `🟢 Rota Ótima Nominal (Dijkstra): ${result.distance}m via ${result.pathNodes.join(' ➔ ')} [t_dec = ${result.decisionTimeMs}ms].`;
        simState.kpi.statusLevel = 'success';
        logConsole(`⚡ Dijkstra Nominal: ${src} ➔ ${tgt} = ${result.distance}m (${result.pathNodes.join(' ➔ ')}) em ${result.decisionTimeMs}ms.`);
      }

      animateRouteToken(result.pathNodes);
    } else {
      // Falha de Conectividade (ex: Ponte Crítica TAG-04 bloqueada) -> Trip SIS IEC 61511
      simState.activeRoute = [];
      simState.highlightedEdges = [];
      simState.kpi.distance = Infinity;
      simState.kpi.decisionTimeMs = result.decisionTimeMs;
      simState.kpi.statusMessage = `🛑 TRIP DE SEGURANÇA SIS IEC 61511! Ponte crítica interditada desconectou ${src} de ${tgt} (d = ∞). M-301: OFF | ALM-301: ALARME!`;
      simState.kpi.statusLevel = 'danger';

      simState.devices['CAM-101 (Follow-Me)'] = 'HOLD';
      simState.devices['CAM-102 (BBox)'] = 'BLOQUEIO CRÍTICO';
      simState.devices['AT-201 (NH3)'] = 'ALERTA SIS';
      simState.devices['BT-201 (BMS)'] = '92% (SAFE)';
      simState.devices['M-301 (Tração)'] = 'OFF (FREIO EMERG.)';
      simState.devices['Servo-X (Direção)'] = 'TRAVADO (0°)';
      simState.devices['A-301 (Braço)'] = 'BLOQUEADO (a1=0)';
      simState.devices['ALM-301 (Sirene)'] = 'ALARME';

      logConsole(`🛑 TRIP SIS IEC 61511: Caminho inalcançável (${src} ➔ ${tgt}, d = ∞). Ponte crítica TAG-04 interrompida! Motor M-301 desligado e freio acionado.`);
    }

    updateUI();
  }

  function executeHierholzerInspection() {
    clearAllBlocks();
    simState.activeMode = 'euler';
    const result = runHierholzer();

    simState.activeRoute = result.circuit;
    simState.highlightedEdges = result.edgeSequence;
    simState.eulerDuplicatedEdges = result.duplicatedEdges;
    syncCorridorTags(result.edgeSequence);

    simState.kpi.distance = result.totalDistance;
    simState.kpi.decisionTimeMs = result.decisionTimeMs;
    simState.kpi.statusMessage = `🔍 Varredura Euleriana Completa (Hierholzer + Carteiro Chinês): ${result.totalDistance}m (144m base + 26m eulerização TAG-02/TAG-06) cobrindo 100% dos corredores.`;
    simState.kpi.statusLevel = 'info';

    simState.devices['CAM-101 (Follow-Me)'] = 'MODO INSPEÇÃO';
    simState.devices['CAM-102 (BBox)'] = 'SCAN PISO RFID';
    simState.devices['AT-201 (NH3)'] = 'VARREDURA OK';
    simState.devices['BT-201 (BMS)'] = '86% (24.5V)';
    simState.devices['M-301 (Tração)'] = 'ON (0.9 m/s)';
    simState.devices['Servo-X (Direção)'] = 'MULTICURVA EULER';
    simState.devices['A-301 (Braço)'] = 'RETRAÍDO';
    simState.devices['ALM-301 (Sirene)'] = 'SILENTE';

    logConsole(`🔍 Hierholzer + Carteiro Chinês: 4 nós ímpares (${result.oddVertices.join(', ')}) eulerizados duplicando TAG-02 (12m) e TAG-06 (14m).`);
    logConsole(`🤖 Circuito Euleriano (${result.totalDistance}m): ${result.circuit.join(' ➔ ')}`);
    animateRouteToken(result.circuit);
    updateUI();
  }

  function executeTSPRouting() {
    clearAllBlocks();
    simState.activeMode = 'hamilton';
    const result = runTSP();

    simState.activeRoute = result.tour;
    // Destaca o ciclo fechado nas arestas correspondentes da malha superior
    simState.highlightedEdges = ['e1', 'e3', 'e4', 'e5', 'e7', 'e8'];
    syncCorridorTags(simState.highlightedEdges);

    simState.kpi.distance = result.optCost;
    simState.kpi.decisionTimeMs = result.decisionTimeMs;
    simState.kpi.statusMessage = `🚜 Ciclo Hamiltoniano TSP (Nearest Neighbor: ${result.nnCost}m ➔ 2-Opt: ${result.optCost}m | Economia: -${result.savingsMeters}m / ${result.improvementPct}%): ${result.tour.join(' ➔ ')}.`;
    simState.kpi.statusLevel = 'success';

    simState.devices['CAM-101 (Follow-Me)'] = 'LOCK-OK';
    simState.devices['CAM-102 (BBox)'] = 'LIVRE (d1=0)';
    simState.devices['AT-201 (NH3)'] = '12 ppm (OK)';
    simState.devices['BT-201 (BMS)'] = '91% (+13% ECON.)';
    simState.devices['M-301 (Tração)'] = 'INTERTRAVADO NA COLETA';
    simState.devices['Servo-X (Direção)'] = 'CICLO 2-OPT';
    simState.devices['A-301 (Braço)'] = 'COLETA (a1 → ¬m1)';
    simState.devices['ALM-301 (Sirene)'] = 'SILENTE';

    logConsole(`📐 TSP Nearest Neighbor inicial: ${result.nnTour.join(' ➔ ')} = ${result.nnCost}m (com cruzamento geométrico).`);
    logConsole(`🚜 TSP 2-Opt Refinado: ${result.tour.join(' ➔ ')} = ${result.optCost}m (ganho de ${result.improvementPct}% / -${result.savingsMeters}m). Intertravamento a1 → ¬m1 ativo nas paradas!`);
    animateRouteToken(result.tour, true);
    updateUI();
  }

  function executeDAGFlow() {
    clearAllBlocks();
    simState.activeMode = 'dag';
    const result = runKahn();

    simState.activeRoute = result.topoOrder;
    simState.highlightedEdges = ['e4', 'e5', 'e7'];
    syncCorridorTags(simState.highlightedEdges);

    simState.kpi.distance = result.topoOrder.length;
    simState.kpi.decisionTimeMs = result.decisionTimeMs;
    simState.kpi.statusMessage = `📦 Ordenação Topológica Validada (Algoritmo de Kahn — 0 ciclos/deadlocks): ${result.topoOrder.join(' ➔ ')}.`;
    simState.kpi.statusLevel = 'info';

    simState.devices['CAM-101 (Follow-Me)'] = 'SYNC SCADA';
    simState.devices['CAM-102 (BBox)'] = 'LIVRE';
    simState.devices['AT-201 (NH3)'] = '9 ppm (OK)';
    simState.devices['BT-201 (BMS)'] = '95% (25.3V)';
    simState.devices['M-301 (Tração)'] = 'DESPACHO DAG';
    simState.devices['Servo-X (Direção)'] = 'ALINHADO';
    simState.devices['A-301 (Braço)'] = 'LAUDO AMO-301 OK';
    simState.devices['ALM-301 (Sirene)'] = 'SILENTE';

    logConsole(`📦 Algoritmo de Kahn (${result.decisionTimeMs}ms): Grafo Acíclico Dirigido (DAG) íntegro. Ordem topológica: ${result.topoOrder.join(' ➔ ')}.`);
    animateRouteToken(result.topoOrder);
    updateUI();
  }

  // -------------------------------------------------------------
  // 6. ANIMAÇÃO DO TOKEN DO ROBÔ VISÃO-AGV
  // -------------------------------------------------------------

  function animateRouteToken(nodeSequence, isTspMode = false) {
    if (!nodeSequence || nodeSequence.length === 0) return;
    if (simState.animTimer) clearInterval(simState.animTimer);

    simState.animating = true;
    let step = 0;
    const totalSteps = nodeSequence.length;

    simState.animTimer = setInterval(() => {
      if (step >= totalSteps) {
        clearInterval(simState.animTimer);
        simState.animating = false;
        const lastId = nodeSequence[totalSteps - 1];
        if (NODES[lastId]) {
          simState.agvPosition = { x: NODES[lastId].x, y: NODES[lastId].y };
        }
        if (isTspMode) {
          simState.devices['M-301 (Tração)'] = 'STANDBY (ST-01)';
          simState.devices['A-301 (Braço)'] = 'RETRAÍDO (CICLO FIM)';
        }
        updateUI();
        return;
      }

      const currNodeId = nodeSequence[step];
      const node = NODES[currNodeId];
      if (node) {
        simState.agvPosition = { x: node.x, y: node.y };
        if (isTspMode) {
          const isSamplingStop = (currNodeId === 'AMO-301' || currNodeId === 'R-101' || currNodeId === 'ALM-201');
          simState.devices['M-301 (Tração)'] = isSamplingStop ? 'OFF (PARADA COLETA)' : 'ON (1.2 m/s)';
          simState.devices['A-301 (Braço)'] = isSamplingStop ? `COLETA (${currNodeId})` : 'RETRAÍDO';
        }
        updateUI();
      }
      step++;
    }, 520);
  }

  // -------------------------------------------------------------
  // 7. SINCRONIZAÇÃO DE INTERFACE E LOGS DO SUPERVISÓRIO
  // -------------------------------------------------------------

  function logConsole(msg) {
    const consoleBox = document.getElementById('scada-console-output');
    if (!consoleBox) return;

    const timeStr = new Date().toLocaleTimeString('pt-BR', { hour12: false });
    const line = document.createElement('div');
    line.className = 'scada-log-entry';

    const timeSpan = document.createElement('span');
    timeSpan.style.color = '#64748b';
    timeSpan.textContent = `[${timeStr}] `;

    const msgSpan = document.createElement('span');
    msgSpan.textContent = msg;

    line.appendChild(timeSpan);
    line.appendChild(msgSpan);
    consoleBox.appendChild(line);
    consoleBox.scrollTop = consoleBox.scrollHeight;
  }

  function updateUI() {
    renderSynoptic();

    // Banner de Status
    const statusBanner = document.getElementById('scada-status-banner');
    if (statusBanner) {
      statusBanner.textContent = simState.kpi.statusMessage;
      statusBanner.className = `callout callout-${simState.kpi.statusLevel}`;
      statusBanner.style.margin = '0.5rem 0 1.25rem';
      statusBanner.style.padding = '0.75rem 1rem';
      statusBanner.style.fontSize = '0.9rem';
    }

    // KPIs de Telemetria
    const elDist = document.getElementById('kpi-distance');
    if (elDist) {
      if (simState.kpi.distance === Infinity) {
        elDist.textContent = '∞ (Ponte Bloqueada)';
        elDist.style.color = '#ef4444';
      } else if (simState.activeMode === 'dag') {
        elDist.textContent = `${simState.kpi.distance} estágios`;
        elDist.style.color = '#10b981';
      } else {
        elDist.textContent = `${simState.kpi.distance} m`;
        elDist.style.color = '#38bdf8';
      }
    }

    const elTime = document.getElementById('kpi-latency');
    if (elTime) {
      elTime.textContent = `${simState.kpi.decisionTimeMs} ms`;
    }

    const elRoute = document.getElementById('kpi-route');
    if (elRoute) {
      elRoute.textContent = simState.activeRoute.length > 0
        ? simState.activeRoute.join(' ➔ ')
        : 'Nenhum trajeto ativo (Aguardando comando ou em Trip SIS)';
    }

    // Painel de Tags de Corredor + Sensores/Atuadores Embarcados do Visão-AGV
    const valveGrid = document.getElementById('scada-valves-display');
    if (valveGrid) {
      let html = '';

      // 1. Tags de Corredor (TAG-01 a TAG-08)
      Object.keys(simState.corridors).forEach(tag => {
        const st = simState.corridors[tag];
        let color = '#64748b';
        if (st === 'ATIVO') color = '#10b981';
        else if (st === 'BLOQUEADO') color = '#ef4444';

        html += `<span style="background:${color}22; border:1px solid ${color}; color:${color}; padding:0.18rem 0.45rem; border-radius:4px; font-size:0.73rem; font-family:monospace; margin:1px; display:inline-block;">${tag}: <strong>${st}</strong></span>`;
      });

      // 2. Sensores e Atuadores Embarcados do Visão-AGV
      Object.keys(simState.devices).forEach(dev => {
        const val = simState.devices[dev];
        let color = '#38bdf8';
        if (val.includes('ALARME') || val.includes('CRÍTICO') || val.includes('FREIO')) {
          color = '#ef4444';
        } else if (val.includes('OBSTÁCULO') || val.includes('DESVIO') || val.includes('BIP') || val.includes('MONIT') || val.includes('PARADA')) {
          color = '#f59e0b';
        } else if (val.includes('OK') || val.includes('ON') || val.includes('COLETA') || val.includes('LIVRE')) {
          color = '#10b981';
        }

        html += `<span style="background:${color}18; border:1px solid ${color}; color:${color}; padding:0.18rem 0.45rem; border-radius:4px; font-size:0.73rem; font-family:monospace; margin:1px; display:inline-block;">${dev}: <strong>${val}</strong></span>`;
      });

      valveGrid.innerHTML = html;
    }
  }

  // -------------------------------------------------------------
  // 8. INICIALIZAÇÃO E BINDING DOS BOTÕES E CENÁRIOS RÁPIDOS
  // -------------------------------------------------------------

  function initSimulator() {
    const btnRunDijkstra = document.getElementById('btn-run-dijkstra');
    const btnInjectLeak = document.getElementById('btn-inject-leak');
    const btnHierholzer = document.getElementById('btn-hierholzer');
    const btnTSP = document.getElementById('btn-tsp');
    const btnDAG = document.getElementById('btn-dag');
    const btnReset = document.getElementById('btn-reset-sim');

    const presetNominal = document.getElementById('preset-g2-nominal');
    const presetLeak = document.getElementById('preset-g2-leak');
    const presetPumpFail = document.getElementById('preset-g2-pump-fail');
    const presetAGV = document.getElementById('preset-g2-agv');
    const presetEuler = document.getElementById('preset-g2-euler');

    if (btnRunDijkstra) {
      btnRunDijkstra.addEventListener('click', () => {
        simState.activeMode = simState.blockedEdges.size > 0 ? 'leak' : 'dijkstra';
        if (!simState.selectedSource) simState.selectedSource = 'ST-01';
        if (!simState.selectedTarget) simState.selectedTarget = 'DEP-401';
        executeDijkstraRouting();
      });
    }

    if (btnInjectLeak) {
      btnInjectLeak.addEventListener('click', () => {
        // Alterna obstáculo no corredor direto e6 (TAG-06: AMO-301 -> DEP-401)
        handleCorridorClick('e6');
      });
    }

    if (btnHierholzer) {
      btnHierholzer.addEventListener('click', () => {
        executeHierholzerInspection();
      });
    }

    if (btnTSP) {
      btnTSP.addEventListener('click', () => {
        executeTSPRouting();
      });
    }

    if (btnDAG) {
      btnDAG.addEventListener('click', () => {
        executeDAGFlow();
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (simState.animTimer) clearInterval(simState.animTimer);
        clearAllBlocks();
        simState.activeMode = 'dijkstra';
        simState.selectedSource = 'ST-01';
        simState.selectedTarget = 'DEP-401';
        simState.activeRoute = [];
        simState.highlightedEdges = [];
        simState.agvPosition = { x: NODES['ST-01'].x, y: NODES['ST-01'].y };
        syncCorridorTags([]);

        simState.devices['CAM-101 (Follow-Me)'] = 'LOCK-OK';
        simState.devices['CAM-102 (BBox)'] = 'LIVRE (d1=0)';
        simState.devices['AT-201 (NH3)'] = '8 ppm (OK)';
        simState.devices['BT-201 (BMS)'] = '94% (25.2V)';
        simState.devices['M-301 (Tração)'] = 'STANDBY';
        simState.devices['Servo-X (Direção)'] = '0° (RETO)';
        simState.devices['A-301 (Braço)'] = 'RETRAÍDO';
        simState.devices['ALM-301 (Sirene)'] = 'SILENTE';

        simState.kpi.distance = 0;
        simState.kpi.decisionTimeMs = 0;
        simState.kpi.statusMessage = 'Malha topológica reinicializada. AGV posicionado na estação base ST-01.';
        simState.kpi.statusLevel = 'info';
        logConsole('🔄 Malha AGV resetada: Todos os corredores TAG-01 a TAG-08 livres.');
        updateUI();
      });
    }

    // Cenário 1: Trajeto Nominal (ST-01 -> DEP-401 = 46m)
    if (presetNominal) {
      presetNominal.addEventListener('click', () => {
        clearAllBlocks();
        simState.selectedSource = 'ST-01';
        simState.selectedTarget = 'DEP-401';
        simState.activeMode = 'dijkstra';
        logConsole('🟢 Cenário 1 [Nominal]: Despachando AGV de ST-01 para DEP-401 pela rota mínima.');
        executeDijkstraRouting();
      });
    }

    // Cenário 2: Obstáculo no Corredor Direto TAG-06 (AMO-301 -> DEP-401) -> Desvio via R-101 (75m)
    if (presetLeak) {
      presetLeak.addEventListener('click', () => {
        clearAllBlocks();
        const e6 = AGV_EDGES.find(e => e.id === 'e6');
        if (e6) e6.status = 'blocked';
        simState.blockedEdges.add('e6');
        simState.selectedSource = 'ST-01';
        simState.selectedTarget = 'DEP-401';
        simState.activeMode = 'leak';
        logConsole('🔴 Cenário 2 [Obstáculo CAM-102]: Corredor direto TAG-06 (AMO-301 ➔ DEP-401) bloqueado! Recalculando desvio via R-101...');
        executeDijkstraRouting();
      });
    }

    // Cenário 3: Bloqueio no Acesso Direto ao Almoxarifado TAG-02 (ST-01 -> ALM-201) -> Rota via Doca DOC-101 (59m)
    if (presetPumpFail) {
      presetPumpFail.addEventListener('click', () => {
        clearAllBlocks();
        const e2 = AGV_EDGES.find(e => e.id === 'e2');
        if (e2) e2.status = 'blocked';
        simState.blockedEdges.add('e2');
        simState.selectedSource = 'ST-01';
        simState.selectedTarget = 'DEP-401';
        simState.activeMode = 'leak';
        logConsole('⚡ Cenário 3 [Interdição TAG-02]: Corredor ST-01 ➔ ALM-201 interditado! Comutando rota secundária via Doca A (DOC-101)...');
        executeDijkstraRouting();
      });
    }

    // Cenário 4: Rota de Coleta Múltipla (TSP Nearest Neighbor 155.6m -> 2-Opt 135.6m)
    if (presetAGV) {
      presetAGV.addEventListener('click', () => {
        logConsole('🚜 Cenário 4 [Coleta Múltipla TSP]: Otimizando ciclo Hamiltoniano nas 6 estações com Nearest Neighbor + 2-Opt...');
        executeTSPRouting();
      });
    }

    // Cenário 5: Varredura Completa do Galpão (Hierholzer + Carteiro Chinês = 170m)
    if (presetEuler) {
      presetEuler.addEventListener('click', () => {
        logConsole('🔍 Cenário 5 [Inspeção Euleriana]: Executando Algoritmo de Hierholzer para varredura completa das tags RFID...');
        executeHierholzerInspection();
      });
    }

    // Renderização inicial
    updateUI();
    logConsole('🚀 Emulador Topológico Visão-AGV / SCADA-Core inicializado (Frequência: 100Hz).');
    logConsole('💡 Clique nos cenários rápidos ou diretamente nas etiquetas TAG-01 a TAG-08 (clique em TAG-04 para testar o Trip SIS de Ponte Crítica!).');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSimulator);
  } else {
    initSimulator();
  }

  window.ScadaGraphSim = {
    runDijkstra,
    runHierholzer,
    runTSP,
    runKahn,
    simState
  };

})();