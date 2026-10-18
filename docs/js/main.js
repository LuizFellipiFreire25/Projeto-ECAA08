/**
 * main.js - Visão-AGV / SCADA-Core Logístico
 * 
 * Projeto: Navegação Autônoma, Roteamento Topológico e Desvio Dinâmico de Obstáculos para AGV Logístico
 * Disciplina: ECAA08 - Sistemas Ciberfísicos / Automação
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
});

/* ==========================================================================
   1. GERENCIAMENTO DE TEMA (MODO ESCURO / MODO CLARO)
   ========================================================================== */
function initThemeToggle() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (!themeToggleBtn) return;

  const currentTheme = localStorage.getItem('scada-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeIcon(themeToggleBtn, currentTheme);

  themeToggleBtn.addEventListener('click', () => {
    const activeTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
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
    menuBtn.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
  });

  // Fechar menu ao clicar em qualquer link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      menuBtn.textContent = '☰';
    });
  });
}

/* ==========================================================================
   3. APRESENTAÇÃO EXECUTIVA INTERATIVA DE 10 SLIDES (PROJETO AGV)
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
      window.MathJax.typesetPromise([slides[currentSlide]]);
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

    // Verifica se a seção de apresentação está visível
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
   5. INJEÇÃO DOS CRÉDITOS DOS DISCENTES DO PROJETO AGV LOGÍSTICO
   ========================================================================== */
function initDiscentesCredits() {
  const footerBottom = document.querySelector('.footer .footer-bottom');
  if (!footerBottom) return;

  // Atualiza ou insere o bloco de membros do grupo
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
      <span style="color: #38bdf8; font-weight: bold;">🚜 Projeto Visão-AGV Logístico</span>
      <span>•</span>
      <span><strong>Discentes:</strong> Luiz Fellipi | Daniel Melo | Vinicius Kody | Vinicius Resende</span>
      <span>•</span>
      <span>ECAA08 - UNIFEI 2026.2</span>
    </div>
  `;
}