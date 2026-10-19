/**
 * main.js - Visão-AGV / SCADA-Core Logístico
 * 
 * Projeto: Sistema de Controle Visão-AGV — Modo Follow-Me, Inspeção e Amostragem Química
 * Disciplina: ECAA08 - Automática / Sistemas Ciberfísicos
 * Instituição: UNIFEI - Universidade Federal de Itajubá
 * 
 * Discentes:
 *  - Luiz Fellipi
 *  - Daniel Melo
 *  - Vinicius Kody
 *  - Vinicius Resende
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initMobileMenu();
  initPresentationController();
  initDiscentesCredits();
  initSmoothScroll();
  initScadaSimulator();
});

/* ==========================================================================
   1. GERENCIAMENTO DE TEMA (MODO ESCURO / MODO CLARO)
   ========================================================================== */
function initThemeToggle() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (!themeToggleBtn) return;

  const currentTheme = localStorage.getItem('scada-theme') || 'dark';
  if (currentTheme === 'light') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
  updateThemeIcon(themeToggleBtn, currentTheme);

  themeToggleBtn.addEventListener('click', () => {
    const activeTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
    
    if (newTheme === 'light') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    localStorage.setItem('scada-theme', newTheme);
    updateThemeIcon(themeToggleBtn, newTheme);
  });
}

function updateThemeIcon(btn, theme) {
  btn.textContent = theme === 'dark' ? '☀️' : '🌙';
  btn.setAttribute('title', theme === 'dark' ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro');
}

/* ==========================================================================
   2. NAVEGAÇÃO MOBILE (MENU HAMBÚRGUER)
   ========================================================================== */
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');

  if (!menuBtn || !navLinks) return;

  menuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    navLinks.classList.toggle('open');
    const isOpen = navLinks.classList.contains('active') || navLinks.classList.contains('open');
    menuBtn.textContent = isOpen ? '✕' : '☰';
  });

  // Fechar menu ao clicar em qualquer link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      navLinks.classList.remove('open');
      menuBtn.textContent = '☰';
    });
  });
}

/* ==========================================================================
   3. APRESENTAÇÃO EXECUTIVA INTERATIVA DE SLIDES (PROJETO VISÃO-AGV)
   ========================================================================== */
function initPresentationController() {
  const slides = document.querySelectorAll('.presentation-viewport .slide');
  const prevBtn = document.getElementById('pres-prev-btn');
  const nextBtn = document.getElementById('pres-next-btn');
  const counter = document.getElementById('pres-slide-counter');
  const dotsContainer = document.getElementById('slide-dots');

  if (!slides.length || !prevBtn || !nextBtn) return;

  let currentSlide = 0;
  const totalSlides = slides.length;

  // Gerar dots indicadores
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    slides.forEach((_, idx) => {
      const dot = document.createElement('button');
      dot.className = `slide-dot ${idx === 0 ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Ir para o Slide ${idx + 1}`);
      dot.addEventListener('click', () => goToSlide(idx));
      dotsContainer.appendChild(dot);
    });
  }

  function updateSlideState() {
    slides.forEach((slide, idx) => {
      slide.classList.toggle('active', idx === currentSlide);
    });

    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll('.slide-dot');
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentSlide);
      });
    }

    if (counter) {
      counter.textContent = `Slide ${currentSlide + 1} de ${totalSlides}`;
    }

    prevBtn.disabled = currentSlide === 0;
    nextBtn.disabled = currentSlide === totalSlides - 1;

    // Renderizar novamente equações MathJax se o slide contiver TeX
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise([slides[currentSlide]]).catch(err => console.log(err));
    }
  }

  function goToSlide(index) {
    if (index >= 0 && index < totalSlides) {
      currentSlide = index;
      updateSlideState();
    }
  }

  prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
  nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));

  // Suporte a controle pelas setas do teclado (← e →)
  document.addEventListener('keydown', (e) => {
    const presSection = document.getElementById('apresentacao');
    if (!presSection) return;

    const rect = presSection.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;

    if (isVisible) {
      if (e.key === 'ArrowLeft') {
        goToSlide(currentSlide - 1);
      } else if (e.key === 'ArrowRight') {
        goToSlide(currentSlide + 1);
      }
    }
  });

  updateSlideState();
}

/* ==========================================================================
   4. ROTEAMENTO SUAVE (SMOOTH SCROLLING) E LINK ATIVO
   ========================================================================== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

/* ==========================================================================
   5. INJEÇÃO DOS CRÉDITOS DOS DISCENTES DO PROJETO VISÃO-AGV LOGÍSTICO
   ========================================================================== */
function initDiscentesCredits() {
  const footerBottom = document.querySelector('.footer .footer-bottom');
  if (!footerBottom) return;

  let discentesContainer = document.getElementById('discentes-credits');
  if (!discentesContainer) {
    discentesContainer = document.createElement('div');
    discentesContainer.id = 'discentes-credits';
    discentesContainer.style.cssText = `
      margin-top: 0.75rem;
      padding-top: 0.75rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      font-size: 0.85rem;
      color: #94a3b8;
      font-family: var(--font-mono, monospace);
    `;
    footerBottom.appendChild(discentesContainer);
  }

  discentesContainer.innerHTML = `
    <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 1rem; align-items: center;">
      <span style="color: #38bdf8; font-weight: bold;">🚜 Projeto Visão-AGV Logístico (Follow-Me OpenCV)</span>
      <span>•</span>
      <span><strong>Discentes:</strong> Luiz Fellipi | Daniel Melo | Vinicius Kody | Vinicius Resende</span>
      <span>•</span>
      <span>ECAA08 - UNIFEI 2026.2</span>
    </div>
  `;
}

/* ==========================================================================
   6. SIMULADOR SCADA-CORE DA ETAPA 01 (VISÃO-AGV FOLLOW-ME & INFERÊNCIA)
   ========================================================================== */
function initScadaSimulator() {
  // Sliders de telemetria
  const sliderCam101 = document.getElementById('sim-cam101');
  const sliderCam102 = document.getElementById('sim-cam102');
  const sliderAT201 = document.getElementById('sim-at201');
  const sliderBT201 = document.getElementById('sim-bt201');
  const sliderTempBMS = document.getElementById('sim-temp-bms');

  // Checkboxes digitais
  const chkESD200 = document.getElementById('sim-esd200');
  const chkOverride = document.getElementById('sim-override');
  const chkWifiFail = document.getElementById('sim-wifi-fail');
  const chkRotorLock = document.getElementById('sim-rotor-lock');
  const chkSamplingReq = document.getElementById('sim-sampling-req');

  if (!sliderCam101) return;

  // Displays numéricos
  const valCam101 = document.getElementById('val-cam101');
  const valCam102 = document.getElementById('val-cam102');
  const valAT201 = document.getElementById('val-at201');
  const valBT201 = document.getElementById('val-bt201');
  const valTempBMS = document.getElementById('val-temp-bms');

  // Badges de proposições lógicas
  const propC1 = document.getElementById('prop-c1');
  const propD1 = document.getElementById('prop-d1');
  const propG1 = document.getElementById('prop-g1');
  const propB1 = document.getElementById('prop-b1');
  const propS1 = document.getElementById('prop-s1');
  const propOm = document.getElementById('prop-om');
  const propF = document.getElementById('prop-f');
  const propPmov = document.getElementById('prop-pmov');
  const propM1 = document.getElementById('prop-m1');
  const propA1 = document.getElementById('prop-a1');
  const propL1 = document.getElementById('prop-l1');

  // Painéis de status matemático, quantificadores e inferência
  const sisStatus = document.getElementById('scada-sis-status');
  const mathProofStatus = document.getElementById('scada-math-proof');
  const predicatesStatus = document.getElementById('scada-predicates-status');
  const inferenceLog = document.getElementById('scada-inference-output');
  const consoleLog = document.getElementById('scada-console-log');

  // Elementos do Sinótico SVG do AGV
  const synAlarmBeacon = document.getElementById('syn-alarm-beacon');
  const synAgvBeacon = document.getElementById('syn-agv-beacon');
  const synGasCloud = document.getElementById('syn-gas-cloud');
  const synBboxOperator = document.getElementById('syn-bbox-operator');
  const synBboxLabel = document.getElementById('syn-bbox-label');
  const synOperatorGroup = document.getElementById('syn-operator-group');
  const synVisionBeam = document.getElementById('syn-vision-beam');
  const synM301State = document.getElementById('syn-m301-state');
  const synA301State = document.getElementById('syn-a301-state');
  const synArmExt = document.getElementById('syn-arm-ext');
  const synBt201Bar = document.getElementById('syn-bt201-bar');
  const synWheel1 = document.getElementById('syn-wheel-1');
  const synWheel2 = document.getElementById('syn-wheel-2');
  const synStatusText = document.getElementById('syn-status-text');

  let wheelAngle = 0;
  let simState = {
    m1: true,
    a1: false,
    l1: false
  };

  // Animação contínua das rodas do AGV quando M-301 (m1) está ativo
  setInterval(() => {
    if (simState.m1) {
      wheelAngle = (wheelAngle + 20) % 360;
      if (synWheel1) synWheel1.setAttribute('transform', `rotate(${wheelAngle}, 215, 215)`);
      if (synWheel2) synWheel2.setAttribute('transform', `rotate(${wheelAngle}, 285, 215)`);
    }
  }, 60);

  // Botões de Presets
  const presetNormal = document.getElementById('preset-normal');
  const presetCollision = document.getElementById('preset-collision');
  const presetToxic = document.getElementById('preset-toxic');
  const presetBMS = document.getElementById('preset-bms');
  const presetESD = document.getElementById('preset-esd');
  const presetSampling = document.getElementById('preset-sampling');

  if (presetNormal) {
    presetNormal.addEventListener('click', () =>
      applyPreset('Operação Follow-Me Nominal', 88, 1.8, 2.0, 85, 32, false, false, false, false, false)
    );
  }
  if (presetCollision) {
    presetCollision.addEventListener('click', () =>
      applyPreset('Obstáculo Crítico + Falha Wi-Fi (R-01 / R-02)', 92, 0.35, 2.0, 80, 34, false, false, true, false, false)
    );
  }
  if (presetToxic) {
    presetToxic.addEventListener('click', () =>
      applyPreset('Vazamento Tóxico de NH3 (AT-201 / R-04)', 85, 1.6, 42.0, 78, 35, false, false, false, false, false)
    );
  }
  if (presetBMS) {
    presetBMS.addEventListener('click', () =>
      applyPreset('Descarga Crítica + Fuga Térmica BMS (R-05 / R-06)', 82, 1.5, 3.0, 8, 68, false, false, false, false, false)
    );
  }
  if (presetESD) {
    presetESD.addEventListener('click', () =>
      applyPreset('Acionamento Manual de Emergência (ESD-200)', 90, 1.5, 2.0, 84, 33, true, false, false, false, false)
    );
  }
  if (presetSampling) {
    presetSampling.addEventListener('click', () =>
      applyPreset('Amostragem Química Estacionária (Braço A-301)', 86, 1.4, 1.5, 90, 31, false, false, false, false, true)
    );
  }

  function applyPreset(name, cam101, cam102, at201, bt201, tempBms, esd, override, wifiFail, rotorLock, samplingReq) {
    sliderCam101.value = cam101;
    sliderCam102.value = cam102;
    sliderAT201.value = at201;
    sliderBT201.value = bt201;
    if (sliderTempBMS) sliderTempBMS.value = tempBms;
    if (chkESD200) chkESD200.checked = esd;
    if (chkOverride) chkOverride.checked = override;
    if (chkWifiFail) chkWifiFail.checked = wifiFail;
    if (chkRotorLock) chkRotorLock.checked = rotorLock;
    if (chkSamplingReq) chkSamplingReq.checked = samplingReq;

    logConsole(`[PRESET] ${name} -> Conf=${cam101}%, Dist=${cam102}m, NH3=${at201}ppm, Bat=${bt201}%, BMS=${tempBms}°C`, 'info');
    updateSimulation();
  }

  function logConsole(msg, type = 'info') {
    if (!consoleLog) return;
    const now = new Date().toTimeString().split(' ')[0] + '.' + String(new Date().getMilliseconds()).padStart(3, '0');
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.textContent = `[${now}] ${msg}`;
    consoleLog.prepend(entry);
    if (consoleLog.children.length > 30) {
      consoleLog.removeChild(consoleLog.lastChild);
    }
  }

  function updateBadge(badge, text, val, invertColor = false) {
    if (!badge) return;
    const isGood = invertColor ? !val : val;
    badge.className = 'prop-badge ' + (val ? 'active-true' : 'active-false');
    badge.textContent = `${text}: ${val ? '1 (TRUE)' : '0 (FALSE)'}`;
  }

  function updateSimulation() {
    const conf = parseFloat(sliderCam101.value);
    const dist = parseFloat(sliderCam102.value);
    const nh3 = parseFloat(sliderAT201.value);
    const soc = parseFloat(sliderBT201.value);
    const tempBms = sliderTempBMS ? parseFloat(sliderTempBMS.value) : 32.0;

    const s1 = chkESD200 ? chkESD200.checked : false;
    const om = chkOverride ? chkOverride.checked : false;
    const wifiFail = chkWifiFail ? chkWifiFail.checked : false;
    const rotorLock = chkRotorLock ? chkRotorLock.checked : false;
    const samplingReq = chkSamplingReq ? chkSamplingReq.checked : false;

    // Atualiza displays numéricos
    if (valCam101) valCam101.textContent = `${conf.toFixed(0)} %`;
    if (valCam102) valCam102.textContent = `${dist.toFixed(2)} m`;
    if (valAT201) valAT201.textContent = `${nh3.toFixed(1)} ppm`;
    if (valBT201) valBT201.textContent = `${soc.toFixed(0)} %`;
    if (valTempBMS) valTempBMS.textContent = `${tempBms.toFixed(0)} °C`;

    // 1. DISCRETIZAÇÃO DAS PROPOSIÇÕES ATÔMICAS (AULA 02)
    const c1 = conf > 50.0;       // CAM-101: Operador detectado (MobileNet V2 > 50%)
    const d1 = dist <= 0.50;      // CAM-102: Operador em zona de colisão (<= 0.50 m / BBox grande)
    const g1 = nh3 >= 25.0;       // AT-201: Concentração de amônia crítica (>= 25 ppm)
    const b1 = soc < 10.0;        // BT-201: Bateria em nível crítico (< 10%)
    const tempHigh = tempBms >= 60.0; // Sobreaquecimento BMS (>= 60 °C)

    // 2. EQUAÇÕES BOOLEANAS E INTERTRAVAMENTO (AULAS 03, 04 E 05)
    // Falha Crítica: F ≡ s1 ∨ b1 ∨ g1 (incluindo proteção térmica/rotor se crítico)
    const F = s1 || b1 || g1;

    // Permissivo de Movimento Otimizado (Aula 05): P_mov ≡ c1 ∧ ¬d1 ∧ (¬F ∨ Om)
    // Nota: Botão físico ESD-200 (s1) corta a potência por hardware mesmo com Override (Om)
    const P_mov = c1 && !d1 && (!F || (om && !s1));

    // Motor de Tração M-301 (m1): avança se P_mov = 1, sem bloqueio mecânico e sem coleta estacionária ativa
    const m1 = P_mov && !samplingReq && !rotorLock && !tempHigh;

    // Braço de Amostragem A-301 (a1): Intertravamento a1 → (¬m1 ∧ ¬F)
    const a1 = samplingReq && !m1 && !F && !d1;

    // Alarme Audiovisual ALM-301 (l1): Acionado se F ∨ d1 ∨ rotorLock ∨ tempHigh
    const l1 = F || d1 || rotorLock || tempHigh || wifiFail;

    simState.m1 = m1;
    simState.a1 = a1;
    simState.l1 = l1;

    // Atualiza Badges de Proposições
    updateBadge(propC1, 'c1 (CAM-101 >50%)', c1);
    updateBadge(propD1, 'd1 (CAM-102 ≤0.5m)', d1);
    updateBadge(propG1, 'g1 (AT-201 ≥25ppm)', g1);
    updateBadge(propB1, 'b1 (BT-201 <10%)', b1);
    updateBadge(propS1, 's1 (ESD-200)', s1);
    updateBadge(propOm, 'Om (Override)', om);
    updateBadge(propF, 'F (s1∨b1∨g1)', F);
    updateBadge(propPmov, 'P_mov', P_mov);
    updateBadge(propM1, 'm1 (Tração M-301)', m1);
    updateBadge(propA1, 'a1 (Braço A-301)', a1);
    updateBadge(propL1, 'l1 (Alarme ALM-301)', l1);

    // 3. LÓGICA DE PREDICADOS E QUANTIFICADORES (AULA 06)
    // Domínio S_AGV = {s1, g1, b1, d1}
    const forallSafe = !s1 && !g1 && !b1 && !d1;
    const existsFault = s1 || g1 || b1 || d1;

    if (predicatesStatus) {
      predicatesStatus.innerHTML = `
        • $\\text{Permissivo}_{\\forall} \\equiv \\forall x \\in \\mathcal{S}_{\\text{AGV}}, \\neg \\text{Fault}(x)$: <strong>${forallSafe ? '<span style="color:#10b981;">VERDADEIRO (1) — Malha Íntegra</span>' : '<span style="color:#ef4444;">FALSO (0) — Violação Detectada</span>'}</strong><br>
        • $\\text{Trip}_{\\exists} \\equiv \\exists x \\in \\mathcal{S}_{\\text{AGV}}, \\text{Fault}(x)$: <strong>${existsFault ? '<span style="color:#ef4444;">VERDADEIRO (1) — Parada Acionada</span>' : '<span style="color:#10b981;">FALSO (0) — Sem Anomalias</span>'}</strong>
      `;
    }

    // 4. MOTOR ESPECIALISTA FORWARD CHAINING (AULAS 08, 09 E 10)
    const firedRules = [];

    // R-01: LIDAR_ZONA_VERMELHA (d1) ∧ VELOCIDADE_GT_ZERO (c1) -> RISCO_COLISAO_IMINENTE
    const riscoColisao = d1 && c1;
    if (riscoColisao) {
      firedRules.push({
        id: 'R-01',
        conseq: 'RISCO_COLISAO_IMINENTE',
        desc: 'Intrusão de Obstáculo / Operador na Zona Vermelha (CAM-102 / LiDAR <= 0.5m)',
        sev: 'CRÍTICA (SIL 3) • Prio 10 • 50ms',
        pop: 'Cortar PWM do motor M-301 imediatamente e acionar freio eletromagnético.'
      });
    }

    // R-02: RISCO_COLISAO_IMINENTE ∧ FALHA_COMUNIC_WIFI -> TRIP_ISOLAMENTO_TOTAL (Encadeamento de 2º nível!)
    if (riscoColisao && wifiFail) {
      firedRules.push({
        id: 'R-02',
        conseq: 'TRIP_ISOLAMENTO_TOTAL',
        desc: 'AGV Cego/Incomunicável em Rota de Colisão (Encadeamento R-01 -> R-02)',
        sev: 'EMERGÊNCIA (SIL 3) • Prio 10 • 10ms',
        pop: 'Bloqueio mecânico total de ponte H e disparo de sirene contínua ALM-301.'
      });
    }

    // R-04: SENSOR_GAS_NH3_HIGH (g1) -> ABORTAR_MISSAO_QUIMICA
    if (g1) {
      firedRules.push({
        id: 'R-04',
        conseq: 'ABORTAR_MISSAO_QUIMICA',
        desc: `Entrada em Zona de Vazamento Tóxico de Amônia (${nh3.toFixed(1)} ppm >= 25 ppm)`,
        sev: 'CRÍTICA • Prio 9 • 200ms',
        pop: 'Recolher braço A-301, bloquear ignição e emitir alerta de evacuação do Setor 300.'
      });
    }

    // R-06: BMS_TEMP_HIGH ∧ CORRENTE_CARGA_HIGH -> RISCO_FUGA_TERMICA
    if (tempHigh) {
      firedRules.push({
        id: 'R-06',
        conseq: 'RISCO_FUGA_TERMICA',
        desc: `Sobreaquecimento Severo do Pack de Lítio BMS (${tempBms.toFixed(0)} °C >= 60 °C)`,
        sev: 'CRÍTICA • Prio 8 • 150ms',
        pop: 'Abrir contator principal da bateria BT-201 para prevenir Thermal Runaway.'
      });
    }

    // R-03: MOTOR_PWM_HIGH ∧ ENCODER_RPM_ZERO -> ROTOR_BLOQUEADO
    if (rotorLock) {
      firedRules.push({
        id: 'R-03',
        conseq: 'ROTOR_BLOQUEADO',
        desc: 'Travamento Mecânico da Roda de Tração M-301 (PWM Alto com RPM = 0)',
        sev: 'ALTA • Prio 7 • 100ms',
        pop: 'Desarmar driver de corrente para evitar queima dos enrolamentos do motor DC.'
      });
    }

    // R-05: BATERIA_SOC_LOW ∧ CARGA_ENGATADA -> BMS_DESCARGA_CRITICA
    if (soc <= 15.0) {
      firedRules.push({
        id: 'R-05',
        conseq: 'BMS_DESCARGA_CRITICA',
        desc: `Tensão Crítica na Bateria BT-201 (SoC = ${soc.toFixed(0)}%) sob Operação Logística`,
        sev: 'MÉDIA/ALTA • Prio 4 • 500ms',
        pop: 'Interromper amostragem e retornar imediatamente ao Berço de Recarga (ST-01).'
      });
    }

    // R-ESD: Botão de Emergência Físico ESD-200
    if (s1) {
      firedRules.push({
        id: 'R-ESD',
        conseq: 'SHUTDOWN_HARDWARE_ESD200',
        desc: 'Botão Cogumelo ESD-200 Pressionado pelo Operador (Contato NF Aberto)',
        sev: 'EMERGÊNCIA • Prio 10 • <5ms',
        pop: 'Rearme manual físico obrigatório após inspeção visual da área.'
      });
    }

    if (inferenceLog) {
      if (firedRules.length === 0) {
        if (!c1) {
          inferenceLog.innerHTML = `<span style="color:#fbbf24;">⚠️ <strong>Standby Visual (CAM-101):</strong> Confiança MobileNet V2 (${conf}%) abaixo de 50%. AGV aguardando detecção segura do operador humano.</span>`;
        } else if (a1) {
          inferenceLog.innerHTML = `<span style="color:#38bdf8;">🧪 <strong>Modo Amostragem Ativo (A-301):</strong> Tração M-301 bloqueada por intertravamento ($a_1 \\rightarrow \\neg m_1$) para coleta segura no tanque.</span>`;
        } else {
          inferenceLog.innerHTML = `<span style="color:#10b981;">✅ <strong>Sistema Especialista Nominal:</strong> Modo <em>Follow-Me</em> ativo. Nenhuma regra de falha disparada na Agenda de Conflitos.</span>`;
        }
      } else {
        let html = `<strong style="color:#ef4444;">🚨 Agenda Forward Chaining (${firedRules.length} regra(s) disparada(s) por Prioridade SIL):</strong><ul style="padding-left: 1.2rem; margin-top: 0.4rem;">`;
        firedRules.forEach(r => {
          html += `<li style="margin-bottom:0.35rem;"><strong>[${r.id} → ${r.conseq}]</strong> (${r.sev}): ${r.desc}<br><em style="color:#94a3b8; font-size:0.82em;">→ Ação SCADA: ${r.pop}</em></li>`;
        });
        html += `</ul>`;
        inferenceLog.innerHTML = html;
      }
    }

    // 5. PROVA FORMAL DE TAUTOLOGIA E INVARIANTE DE SEGURANÇA (AULAS 03 E 05)
    const sRisco = F && m1 && !om;
    if (sisStatus && mathProofStatus) {
      if (F || d1 || rotorLock || tempHigh) {
        sisStatus.innerHTML = `<span style="color:#ef4444; font-weight:bold;">🛑 INTERTRAVAMENTO ATUADO (TRAÇÃO BLOQUEADA / ALARME ATIVO)</span>`;
      } else if (a1) {
        sisStatus.innerHTML = `<span style="color:#38bdf8; font-weight:bold;">🧪 COLETA QUÍMICA ESTACIONÁRIA (A-301 ESTENDIDO | M-301 PARADO)</span>`;
      } else if (m1) {
        sisStatus.innerHTML = `<span style="color:#10b981; font-weight:bold;">🟢 FOLLOW-ME OPERACIONAL (M-301 ATIVO | SEGUINDO OPERADOR)</span>`;
      } else {
        sisStatus.innerHTML = `<span style="color:#f59e0b; font-weight:bold;">⏸️ AGV EM STANDBY (AGUARDANDO PERMISSIVO P_mov)</span>`;
      }

      mathProofStatus.innerHTML = `
        • <strong>Falha Crítica ($F \\equiv s_1 \\lor b_1 \\lor g_1$):</strong> $F = ${s1 ? 1 : 0} \\lor ${b1 ? 1 : 0} \\lor ${g1 ? 1 : 0} = \\mathbf{${F ? 1 : 0}}$<br>
        • <strong>Permissivo Otimizado (Aula 05):</strong> $P_{\\text{mov}} \\equiv c_1 \\land \\neg d_1 \\land (\\neg F \\lor O_m) = ${c1 ? 1 : 0} \\land ${!d1 ? 1 : 0} \\land ${(!F || (om && !s1)) ? 1 : 0} = \\mathbf{${P_mov ? 1 : 0}}$<br>
        • <strong>Intertravamento Braço ($a_1 \\rightarrow \\neg m_1$):</strong> $\\neg a_1 \\lor \\neg m_1 = ${(!a1 || !m1) ? '\\mathbf{1\\text{ (Válido)}}' : '\\mathbf{0}'}$<br>
        • <strong>Teorema de Segurança (Aula 03):</strong> $(F \\land m_1) \\land (\\neg m_1 \\lor \\neg F) = \\mathbf{${sRisco ? '1' : '0\\text{ (FALSO — Tautologia Comprovada)}'}} $
      `;
    }

    // 6. ATUALIZAÇÃO DO SINÓTICO SVG DO VISÃO-AGV
    updateAgvSynoptic(c1, d1, g1, b1, s1, m1, a1, l1, conf, dist, soc);

    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise([predicatesStatus, mathProofStatus, inferenceLog]).catch(() => {});
    }
  }

  function updateAgvSynoptic(c1, d1, g1, b1, s1, m1, a1, l1, conf, dist, soc) {
    // Alarme visual no topo e giroflex no chassi do AGV
    if (synAlarmBeacon) {
      synAlarmBeacon.style.display = l1 ? 'inline-block' : 'none';
    }
    if (synAgvBeacon) {
      synAgvBeacon.setAttribute('fill', l1 ? '#ef4444' : '#334155');
    }

    // Nuvem de Amônia NH3 (AT-201)
    if (synGasCloud) {
      synGasCloud.style.display = g1 ? 'block' : 'none';
    }

    // Posição e cor da Bounding Box do Operador (CAM-101 / CAM-102)
    // dist varia de 0.2m (muito perto do AGV, x~145) até 5.0m (longe, x~55)
    const normDist = Math.min(1, Math.max(0, (dist - 0.2) / 4.8));
    const opX = Math.round(135 - normDist * 85); // Entre 50 e 135
    if (synOperatorGroup) {
      synOperatorGroup.setAttribute('transform', `translate(${opX}, 115)`);
    }

    if (synBboxOperator) {
      if (!c1) {
        synBboxOperator.setAttribute('stroke', '#64748b');
        synBboxOperator.setAttribute('stroke-dasharray', '3,3');
      } else if (d1) {
        synBboxOperator.setAttribute('stroke', '#ef4444');
        synBboxOperator.setAttribute('stroke-dasharray', 'none');
      } else {
        synBboxOperator.setAttribute('stroke', '#10b981');
        synBboxOperator.setAttribute('stroke-dasharray', 'none');
      }
    }

    if (synBboxLabel) {
      synBboxLabel.textContent = c1 ? `ID:OP (${conf.toFixed(0)}%) ${dist.toFixed(1)}m` : `NO TARGET (${conf.toFixed(0)}%)`;
      synBboxLabel.setAttribute('fill', !c1 ? '#94a3b8' : (d1 ? '#ef4444' : '#10b981'));
    }

    if (synVisionBeam) {
      synVisionBeam.setAttribute('stroke', !c1 ? '#475569' : (d1 ? '#ef4444' : '#38bdf8'));
      synVisionBeam.setAttribute('opacity', c1 ? '0.55' : '0.2');
    }

    // Motor de Tração M-301
    if (synM301State) {
      synM301State.setAttribute('fill', m1 ? '#10b981' : '#ef4444');
    }

    // Braço de Amostragem A-301
    if (synA301State) {
      synA301State.setAttribute('fill', a1 ? '#38bdf8' : '#475569');
    }
    if (synArmExt) {
      // Estende o pistão até a válvula do tanque TK-301 se a1 = 1
      synArmExt.setAttribute('x2', a1 ? '415' : '325');
      synArmExt.setAttribute('stroke', a1 ? '#38bdf8' : '#64748b');
    }

    // Barra de nível da bateria BT-201
    if (synBt201Bar) {
      const width = Math.max(2, Math.round((soc / 100) * 36));
      synBt201Bar.setAttribute('width', String(width));
      synBt201Bar.setAttribute('fill', b1 ? '#ef4444' : (soc <= 20 ? '#f59e0b' : '#10b981'));
    }

    // Texto de status no sinótico
    if (synStatusText) {
      if (s1) {
        synStatusText.textContent = 'ESTADO: PARADA DE EMERGÊNCIA (ESD-200)';
        synStatusText.setAttribute('fill', '#ef4444');
      } else if (g1) {
        synStatusText.textContent = 'ESTADO: EVACUAÇÃO / BLOQUEIO POR NH3 TÓXICO';
        synStatusText.setAttribute('fill', '#ef4444');
      } else if (d1) {
        synStatusText.textContent = 'ESTADO: FREIO DE EMERGÊNCIA (ZONA DE COLISÃO)';
        synStatusText.setAttribute('fill', '#ef4444');
      } else if (a1) {
        synStatusText.textContent = 'ESTADO: AMOSTRAGEM QUÍMICA ATIVA (A-301)';
        synStatusText.setAttribute('fill', '#38bdf8');
      } else if (m1) {
        synStatusText.textContent = 'ESTADO: FOLLOW-ME ATIVO (TRAÇÃO PWM M-301)';
        synStatusText.setAttribute('fill', '#10b981');
      } else {
        synStatusText.textContent = 'ESTADO: STANDBY SEGURO (M-301 DESLIGADO)';
        synStatusText.setAttribute('fill', '#fbbf24');
      }
    }
  }

  // Eventos de entrada
  [sliderCam101, sliderCam102, sliderAT201, sliderBT201, sliderTempBMS].forEach(el => {
    if (el) el.addEventListener('input', updateSimulation);
  });

  [chkESD200, chkOverride, chkWifiFail, chkRotorLock, chkSamplingReq].forEach(chk => {
    if (chk) chk.addEventListener('change', updateSimulation);
  });

  updateSimulation();
  logConsole('SCADA-Core Visão-AGV inicializado. Motor Lógico Formal e Sistema Especialista operantes.', 'info');
}