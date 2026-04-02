// Mode sombre par défaut avec mémorisation
document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const toggleBtn = document.getElementById('toggleDarkMode');
  const themeIcon = toggleBtn ? toggleBtn.querySelector('.theme-icon') : null;
  const savedTheme = localStorage.getItem('theme');

  // Activer sombre par défaut si aucune préférence, sinon respecter la sauvegarde
  if (!savedTheme) {
    body.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');
    if (toggleBtn) toggleBtn.setAttribute('aria-label', 'Passer en mode clair');
    if (themeIcon) themeIcon.textContent = '🌞';
  } else if (savedTheme === 'dark') {
    body.classList.add('dark-mode');
    if (toggleBtn) toggleBtn.setAttribute('aria-label', 'Passer en mode clair');
    if (themeIcon) themeIcon.textContent = '🌞';
  } else {
    body.classList.remove('dark-mode');
    if (toggleBtn) toggleBtn.setAttribute('aria-label', 'Passer en mode sombre');
    if (themeIcon) themeIcon.textContent = '🌙';
  }

  // Bascule via bouton
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const isDark = body.classList.toggle('dark-mode');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      // Met à jour l'UI du bouton
      if (isDark) {
        toggleBtn.setAttribute('aria-label', 'Passer en mode clair');
        if (themeIcon) themeIcon.textContent = '🌞';
      } else {
        toggleBtn.setAttribute('aria-label', 'Passer en mode sombre');
        if (themeIcon) themeIcon.textContent = '🌙';
      }
    });
  }

  const introOverlay = document.getElementById('introOverlay');
  if (introOverlay) {
    body.classList.add('intro-active');

    const introCanvas = document.getElementById('introMatrix');
    let stopMatrixAnimation = null;
    const introCountdown = document.getElementById('introCountdown');
    const introTerminal = document.getElementById('introTerminal');
    const introTerminalWrapper = introTerminal ? introTerminal.closest('.intro-terminal') : null;
    const hudValues = document.querySelectorAll('.hud-value');
    const introDuration = 3200;
    const startTime = performance.now();
    let countdownFrame;
    let typingTimeouts = [];
    const hudIntervals = [];

    if (introCountdown) {
      const updateCountdown = () => {
        const elapsed = performance.now() - startTime;
        const remaining = Math.max(introDuration - elapsed, 0) / 1000;
        introCountdown.textContent = remaining.toFixed(1) + 's';
        if (remaining > 0) {
          countdownFrame = requestAnimationFrame(updateCountdown);
        }
      };
      countdownFrame = requestAnimationFrame(updateCountdown);
    }

    if (hudValues.length) {
      hudValues.forEach(el => {
        const min = parseFloat(el.dataset.min) || 0;
        const max = parseFloat(el.dataset.max) || min;
        const unit = el.dataset.unit || '';
        const unitSuffix = unit === '%' ? '%' : unit ? ' ' + unit : '';
        const finalValue = el.dataset.final;
        const formatter = () => {
          const value = (Math.random() * (max - min) + min);
          const isInt = Number.isInteger(min) && Number.isInteger(max);
          const display = isInt ? Math.round(value) : value.toFixed(1);
          el.textContent = display + unitSuffix;
        };
        formatter();
        const interval = setInterval(formatter, 180 + Math.random() * 160);
        hudIntervals.push({ interval, element: el, finalValue, unitSuffix });
      });
    }

    if (introTerminal) {
      const commands = [
        'boot> wake_portfolio --env=public',
        'boot> sync assets --channels=web,mobile',
        'boot> verify pipeline --steps=ui,api',
        'boot> diagnostics --all --verbose',
        'boot> launch --status=ready'
      ];
      const typingSpeed = 32;
      const commandGap = 140;
      let cmdIndex = 0;
      let charIndex = 0;
      let bufferOutput = '';
      let currentLine = '';

      const scheduleTyping = (fn, delay) => {
        const id = setTimeout(fn, delay);
        typingTimeouts.push(id);
      };

      const typeCommand = () => {
        if (cmdIndex >= commands.length) {
          if (introTerminalWrapper) introTerminalWrapper.classList.add('complete');
          return;
        }
        const command = commands[cmdIndex];
        currentLine += command.charAt(charIndex);
        introTerminal.textContent = bufferOutput + currentLine;
        charIndex += 1;
        if (charIndex < command.length) {
          scheduleTyping(typeCommand, typingSpeed);
        } else {
          bufferOutput += command + '\n';
          introTerminal.textContent = bufferOutput;
          currentLine = '';
          charIndex = 0;
          cmdIndex += 1;
          if (cmdIndex < commands.length) {
            scheduleTyping(typeCommand, commandGap);
          } else if (introTerminalWrapper) {
            introTerminalWrapper.classList.add('complete');
          }
        }
      };

      scheduleTyping(typeCommand, 200);
    }

    if (introCanvas) {
      const ctx = introCanvas.getContext('2d');
      const chars = '01<>[]{}|/\\+=-';
      const fontSize = 16;
      let columns = 0;
      let drops = [];

      const resizeMatrix = () => {
        introCanvas.width = window.innerWidth;
        introCanvas.height = window.innerHeight;
        columns = Math.floor(introCanvas.width / fontSize);
        drops = Array(columns).fill(0);
      };

      resizeMatrix();
      window.addEventListener('resize', resizeMatrix);

      let matrixFrame;
      const drawMatrix = () => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.fillRect(0, 0, introCanvas.width, introCanvas.height);
        ctx.fillStyle = '#22d3ee';
        ctx.font = `${fontSize}px "JetBrains Mono", Consolas, monospace`;

        for (let i = 0; i < drops.length; i++) {
          const text = chars.charAt(Math.floor(Math.random() * chars.length));
          ctx.fillText(text, i * fontSize, drops[i] * fontSize);
          if (drops[i] * fontSize > introCanvas.height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i] += 1;
        }

        matrixFrame = requestAnimationFrame(drawMatrix);
      };

      drawMatrix();

      stopMatrixAnimation = () => {
        if (matrixFrame) cancelAnimationFrame(matrixFrame);
        window.removeEventListener('resize', resizeMatrix);
      };
    }

    setTimeout(() => {
      introOverlay.classList.add('intro-finished');
      body.classList.remove('intro-active');
      hudIntervals.forEach(({ element, finalValue, unitSuffix }) => {
        if (!finalValue) return;
        element.textContent = finalValue + (unitSuffix || '');
      });
    }, introDuration);

    introOverlay.addEventListener('transitionend', () => {
      if (!introOverlay.classList.contains('intro-finished')) return;
      if (stopMatrixAnimation) {
        stopMatrixAnimation();
        stopMatrixAnimation = null;
      }
      if (countdownFrame) cancelAnimationFrame(countdownFrame);
      if (typingTimeouts.length) {
        typingTimeouts.forEach(clearTimeout);
        typingTimeouts = [];
      }
      if (hudIntervals.length) {
        hudIntervals.forEach(({ interval }) => clearInterval(interval));
      }
      introOverlay.style.display = 'none';
    }, { once: true });
  }
});

/* --------------------------------------------------
   Navbar Interactions
   -------------------------------------------------- */
const hamburger = document.getElementById('hamburger');
const navbarMenu = document.getElementById('navbarMenu');
const navbar = document.querySelector('.navbar');
const scrollIndicator = document.querySelector('.scroll-indicator');
const navLinks = document.querySelectorAll('.nav-link');

// Toggle menu
if (hamburger && navbarMenu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navbarMenu.classList.toggle('active');
  });

  // Fermer le menu au clic sur un lien
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navbarMenu.classList.remove('active');
    });
  });
}

// Indicateur de scroll
window.addEventListener('scroll', () => {
  const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const scrolled = window.scrollY;
  const scrollPercent = (scrolled / scrollHeight) * 100;
  
  if (scrollIndicator) {
    scrollIndicator.style.width = scrollPercent + '%';
  }

  // Ajouter classe scrolled à navbar
  if (window.scrollY > 10) {
    navbar?.classList.add('scrolled');
  } else {
    navbar?.classList.remove('scrolled');
  }

  // Mettre à jour le lien actif
  updateActiveNavLink();
});

function updateActiveNavLink() {
  const sections = document.querySelectorAll('section');
  let current = '';

  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    if (window.scrollY >= sectionTop - 100) {
      current = section.getAttribute('id') || section.getAttribute('class');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.href.includes(current) || (current === '' && link.href.includes('index'))) {
      link.classList.add('active');
    }
  });
}

// Script pour le bouton CV (vérifie l'existence de l'élément)
const downloadCVBtn = document.getElementById("downloadCV");
if (downloadCVBtn) {
  const cvFilePath = "images/cv-portfolio.pdf";
  downloadCVBtn.setAttribute("href", cvFilePath);
  downloadCVBtn.setAttribute("download", "cv-portfolio.pdf");
  downloadCVBtn.addEventListener("click", () => {
    window.open(cvFilePath, "_blank");
  });
}

// Animation simple sur les projets (zoom au survol)
const projects = document.querySelectorAll(".projects .card");
projects.forEach(card => {
  card.addEventListener("mouseover", () => {
    card.style.transform = "scale(1.05)";
  });
  card.addEventListener("mouseout", () => {
    card.style.transform = "scale(1)";
  });
});

// Animation fade-in au scroll
const faders = document.querySelectorAll('.fade-in');

const appearOptions = {
  threshold: 0.2
};

const appearOnScroll = new IntersectionObserver(function(entries, observer) {
  entries.forEach(entry => {
    if (!entry.isIntersecting) {
      return;
    }
    entry.target.classList.add('visible');
    observer.unobserve(entry.target);
  });
}, appearOptions);

faders.forEach(fader => {
  appearOnScroll.observe(fader);
});

// Gestion du formulaire de contact avec FormSubmit (ne pas preventDefault)
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  // FormSubmit gère l'envoi automatiquement
  // Pas besoin d'event listener - le formulaire se soumet directement
  // La validation HTML5 suffit grâce aux attributs "required"
}

/* --------------------------------------------------
   Interactions pour la page Projets : filtres + modal
   -------------------------------------------------- */
const projectGrid = document.querySelector('.projects-grid');
const filterButtons = document.querySelectorAll('.filter-btn');
const projectModal = document.getElementById('projectModal');
const modalClose = projectModal ? projectModal.querySelector('.modal-close') : null;

if (filterButtons && filterButtons.length) {
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // toggle active
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      // apply filter
      const cards = document.querySelectorAll('.project-card');
      cards.forEach(card => {
        if (filter === '*' || card.dataset.year === filter || card.dataset.type === filter) {
          card.style.display = '';
          requestAnimationFrame(() => card.classList.remove('hidden'));
        } else {
          card.classList.add('hidden');
          setTimeout(() => { card.style.display = 'none'; }, 300);
        }
      });
    });
  });
}

// Ouvrir modal avec données basiques (image, titre, description)
if (projectGrid) {
  projectGrid.addEventListener('click', (e) => {
    const link = e.target.closest('.link');
    if (!link) return;
    e.preventDefault();
    const id = link.getAttribute('data-project');
    openProjectModal(id);
  });
}

async function openProjectModal(id) {
  if (!projectModal) return;
  // minimal dataset - expand as needed
  const data = {
    '1': {
      title: 'Anime-aura – Recherche d\'anime avec l\'API Jikan',
      desc: 'Anime-aura est une application web développée dans le cadre d\'un projet scolaire. Elle permet aux utilisateurs de rechercher des animes en temps réel en s\'appuyant sur l\'API Jikan, qui fournit des données issues de MyAnimeList. Le site affiche des informations détaillées sur chaque anime : titre, synopsis, bande annonce, listes des personnages. L\'objectif est de proposer une interface simple, moderne et intuitive pour découvrir de nouveaux animes.',
      tech: 'HTML5 / CSS3 · React.js · API Jikan (REST) · GitHub Pages',
      media: ['images/anime-aura.png','images/anime-aura2.png','images/anime-aura3.png'],
      link: 'https://github.com/m-ogh/site_api_anime'
    },
    '2': {
      title: 'Pokémon Arena – Jeu de combat en Java',
      desc: 'Pokémon Arena est un projet développé en Java qui simule un mini-jeu de combat inspiré de l’univers Pokémon. Au lancement, le joueur se voit proposer trois Pokémon choisis aléatoirement et doit en sélectionner un pour débuter l’aventure. Le jeu enchaîne ensuite sur des combats au tour par tour, où chaque Pokémon dispose de 4 attaques avec des effets et des dégâts différents. L’objectif est de vaincre l’adversaire en utilisant stratégie et gestion des points de vie. Ce projet met en avant la programmation orientée objet (POO), la gestion des classes, l’héritage et la logique de combat.',
      tech: 'Java (POO) · Maven · IntelliJ IDEA',
      media: ['images/pokemon-arena.png','images/pokemon-arena2.png','images/pokemon-arena3.png','images/pokemon-arena4.png','images/pokemon-arena4.mp4'],
      link: 'https://github.com/m-ogh/PokemonArenaOUGH'
    },
    '3': {
      title: 'Caribbean Digital – Site vitrine WordPress',
      desc: 'Caribbean Digital est un site vitrine conçu avec WordPress pour une agence de marketing spécialisée dans la communication digitale et la stratégie en ligne. Le site met en avant les services proposés (SEO, campagnes publicitaires, gestion des réseaux sociaux, branding) à travers une interface moderne, responsive et optimisée. Il intègre un thème personnalisé, des plugins pour l’optimisation SEO et la gestion des formulaires de contact, ainsi qu’une mise en page claire et attractive.',
      tech: 'WordPress (CMS) · Thème personnalisé (HTML/CSS)',
      media: ['images/caribbean-digital.png','images/caribbean-digital-2.png','images/caribbean-digital-3.png'],
      link: ''
    },
    '4': {
      title: 'Khatiri Ramonage – Site vitrine WordPress',
      desc: 'Dans le cadre de mon stage, j’ai conçu et réalisé un site vitrine pour un autoentrepreneur exerçant dans le domaine du ramonage de cheminées. L’objectif était de mettre en avant ses services (ramonage, entretien, conseils de sécurité) et de faciliter la prise de contact avec ses clients. Le site est responsive, optimisé et intègre un formulaire de contact simple et efficace. Ce projet m’a permis de travailler sur la personnalisation d’un thème WordPress, l’intégration de plugins adaptés, et la mise en place d’une structure claire et professionnelle pour un artisan indépendant.',
      tech: 'WordPress (CMS) · Thème personnalisé (HTML/CSS) · Plugins SEO · Formulaire de contact · Elementor',
      media: ['images/khatiri-ramonage1.png','images/khatiri-ramonage2.png','images/khatiri-ramonage3.png'],
      link: ''    },
    '5': {
      title: 'ImmoTrack – Gestion immobilière',
      desc: 'ImmoTrack est une application conçue pour les propriétaires et gestionnaires immobiliers afin de faciliter le suivi d\'un parc immobilier. Elle permet d\'ajouter, modifier et supprimer des biens avec leurs caractéristiques (surface, localisation, prix, statut), de suivre la disponibilité (loué, en vente, libre), de gérer les interactions avec les utilisateurs (agents, propriétaires), et d\'accéder à un tableau de bord regroupant les indicateurs clés (revenus, taux d\'occupation, nombre de biens). L\'objectif est de proposer un outil simple, propre et évolutif, capable de s\'adapter aux besoins futurs (contrats, notifications, maintenance, reporting).',
      tech: 'Symfony · PHP · Java · MySQL',
      media: ['images/immotrack1.png','images/immotrack2.png','images/immotrack3.png'],
      link: ''    },
    '6': {
      title: 'HELP 94 — Conception d\'un site web d\'aide à la personne',
      desc: 'Dans le cadre de mon stage de 2ème année, j\'ai accompagné une professeure souhaitant relancer son activité secondaire d\'aide à domicile destinée aux seniors. Ma mission principale a été la création complète d\'un site WordPress adapté à un public âgé, intégrant un système de réservation en ligne, une présentation claire des services proposés et une interface accessible. Ce projet m\'a permis de développer mes compétences en gestion de projet web, en relation client et en accessibilité numérique.',
      tech: 'WordPress (CMS) · Accessibilité (WCAG) · Système de réservation · Interface adaptée seniors',
      media: ['images/Capture%20d%27écran%202026-03-28%20152134.png'],
      link: ''    }
  };

  const item = data[id];
  if (!item) return;

  const modalMedia = document.getElementById('modalMedia');
  const carouselTrack = document.getElementById('carouselTrack');
  const carouselDots = document.getElementById('carouselDots');
  const prevBtn = modalMedia ? modalMedia.querySelector('.prev') : null;
  const nextBtn = modalMedia ? modalMedia.querySelector('.next') : null;
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalTech = document.getElementById('modalTech');
  const modalLink = document.getElementById('modalLink');

  // Setup carousel médias (images/vidéos)
  const candidateMedia = Array.isArray(item.media) ? item.media : [item.media];

  async function buildMediaList(srcs) {
    const list = [];
    for (const src of srcs) {
      if (typeof src !== 'string') continue;
      const isVideo = /\.(mp4|webm)$/i.test(src);
      if (isVideo) {
        list.push({ type: 'video', src });
        continue;
      }
      const ok = await new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = src;
      });
      if (ok) list.push({ type: 'image', src });
    }
    return list;
  }

  const mediaList = await buildMediaList(candidateMedia);
  const finalMedia = mediaList.length ? mediaList : candidateMedia.slice(0, 1).map(src => ({ type: 'image', src }));

  if (carouselTrack) {
    carouselTrack.innerHTML = finalMedia.map((m, idx) => {
      const active = idx === 0 ? ' active' : '';
      if (m.type === 'video') {
        return `<div class="carousel-slide${active}"><video src="${m.src}" controls playsinline preload="metadata"></video></div>`;
      }
      return `<div class="carousel-slide${active}" style="background-image:url('${m.src}')"></div>`;
    }).join('');
  }
  if (carouselDots) {
    carouselDots.innerHTML = finalMedia.map((_, idx) => `<button class="dot${idx===0?' active':''}" aria-label="Aller à l'image ${idx+1}" data-index="${idx}"></button>`).join('');
    carouselDots.style.display = finalMedia.length > 1 ? '' : 'none';
  }
  if (prevBtn) prevBtn.style.display = finalMedia.length > 1 ? '' : 'none';
  if (nextBtn) nextBtn.style.display = finalMedia.length > 1 ? '' : 'none';

  let currentIndex = 0;
  let touchStartX = null;
  let touchEndX = null;
  function updateCarousel(index) {
    const slides = carouselTrack ? carouselTrack.querySelectorAll('.carousel-slide') : [];
    const dots = carouselDots ? carouselDots.querySelectorAll('.dot') : [];
    if (!slides.length) return;
    currentIndex = (index + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle('active', i === currentIndex));
    dots.forEach((d, i) => d.classList.toggle('active', i === currentIndex));
  }
  if (prevBtn) prevBtn.onclick = () => updateCarousel(currentIndex - 1);
  if (nextBtn) nextBtn.onclick = () => updateCarousel(currentIndex + 1);
  if (carouselDots) carouselDots.onclick = (e) => {
    const b = e.target.closest('.dot');
    if (!b) return;
    updateCarousel(parseInt(b.getAttribute('data-index'), 10));
  };

  // Keyboard navigation when modal is open
  function handleKeydown(ev) {
    if (projectModal.getAttribute('aria-hidden') === 'true') return;
    if (ev.key === 'ArrowLeft') updateCarousel(currentIndex - 1);
    if (ev.key === 'ArrowRight') updateCarousel(currentIndex + 1);
    if (ev.key === 'Escape') closeProjectModal();
  }
  document.addEventListener('keydown', handleKeydown);
  // Keep reference to remove later
  projectModal._keydownHandler = handleKeydown;

  // Swipe support for mobile
  if (modalMedia) {
    modalMedia.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    modalMedia.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].clientX;
      const dx = touchEndX - (touchStartX ?? touchEndX);
      if (Math.abs(dx) > 30) {
        if (dx < 0) updateCarousel(currentIndex + 1);
        else updateCarousel(currentIndex - 1);
      }
      touchStartX = null; touchEndX = null;
    }, { passive: true });
  }
  if (modalTitle) modalTitle.textContent = item.title;
  if (modalDesc) modalDesc.textContent = item.desc;
  if (modalTech) modalTech.innerHTML = 'Technos : <strong>' + item.tech + '</strong>';
  if (modalLink) {
    if (item.link) {
      modalLink.innerHTML = `<a href="${item.link}" target="_blank" rel="noopener" class="github-link">🔗 Voir sur GitHub</a>`;
      modalLink.style.display = '';
    } else {
      modalLink.innerHTML = '';
      modalLink.style.display = 'none';
    }
  }

  document.documentElement.classList.add('modal-open');
  document.body.classList.add('modal-open');
  projectModal.setAttribute('aria-hidden', 'false');
}

function closeProjectModal() {
  if (!projectModal) return;
  projectModal.setAttribute('aria-hidden', 'true');
  document.documentElement.classList.remove('modal-open');
  document.body.classList.remove('modal-open');
  
  // Remove key listener when closing
  if (projectModal._keydownHandler) {
    document.removeEventListener('keydown', projectModal._keydownHandler);
    projectModal._keydownHandler = null;
  }
}

if (modalClose) modalClose.addEventListener('click', closeProjectModal);
if (projectModal) projectModal.addEventListener('click', (e) => {
  if (e.target === projectModal) closeProjectModal();
});

/* --------------------------------------------------
   Compteurs animés pour stats
   -------------------------------------------------- */
const statsSection = document.querySelector('.stats-advanced-section');
let statsAnimated = false;

function animateCounters() {
  const counters = document.querySelectorAll('.stat-value');
  counters.forEach(counter => {
    const target = parseInt(counter.getAttribute('data-target'));
    const duration = 2000; // 2 secondes
    const start = Date.now();
    
    function updateCounter() {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.floor(progress * target);
      counter.textContent = value + (counter.getAttribute('data-target') === '100' ? '%' : '');
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = target + (counter.getAttribute('data-target') === '100' ? '%' : '');
      }
    }
    
    updateCounter();
  });
}

if (statsSection) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !statsAnimated) {
        statsAnimated = true;
        animateCounters();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  
  observer.observe(statsSection);
}

/* --------------------------------------------------
   Newsletter form
   -------------------------------------------------- */
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = newsletterForm.querySelector('input[type="email"]');
    const btn = newsletterForm.querySelector('button');
    const originalText = btn.textContent;
    
    btn.textContent = '✓ Inscrit !';
    btn.style.background = '#1abc9c';
    
    setTimeout(() => {
      input.value = '';
      btn.textContent = originalText;
      btn.style.background = '';
    }, 2000);
  });
}

/* --------------------------------------------------
   Skills animations and category filtering (ENHANCED)
   -------------------------------------------------- */
function initSkillsAnimation() {
  const skillsSection = document.getElementById('skillsSection');
  if (!skillsSection) return;

  // Trigger animations when section is visible
  const obs = new IntersectionObserver((entries, o) => {
    if (!entries[0].isIntersecting) return;

    // Animate linear bars with CSS variables
    document.querySelectorAll('.skill-list .progress').forEach((el, idx) => {
      const target = el.dataset.percent || el.getAttribute('data-percent') || el.textContent.replace('%','') || '0';
      el.style.setProperty('--progress-width', target + '%');
      el.style.width = '0%';
      setTimeout(() => { el.style.width = target + '%'; }, 120 + idx * 50);
    });

    // Animate radial charts with smooth counting
    document.querySelectorAll('.radial-chart').forEach((rc, idx) => {
      const percent = parseInt(rc.dataset.percent || '0', 10);
      const num = rc.querySelector('.radial-number');
      if (num) {
        let i = 0;
        const step = Math.max(1, Math.floor(percent / 25));
        const timer = setInterval(() => {
          i += step;
          if (i >= percent) { i = percent; clearInterval(timer); }
          num.textContent = i + '%';
        }, 15);
      }
      // Animate conic gradient
      setTimeout(() => {
        rc.style.background = `conic-gradient(var(--accent) ${percent}%, #e9eef2 ${percent}% 100%)`;
      }, 100 + idx * 50);
    });

    o.unobserve(skillsSection);
  }, { threshold: 0.15 });

  obs.observe(skillsSection);

  // Category filtering with smooth transitions
  const catButtons = document.querySelectorAll('.category-btn');
  const cards = document.querySelectorAll('.skill-card');

  catButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      catButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.cat;

      cards.forEach((c, idx) => {
        if (cat === 'all' || c.dataset.cat === cat) {
          c.style.display = '';
          c.style.animation = 'none';
          setTimeout(() => {
            c.style.animation = `cardSlideUp .5s cubic-bezier(.25,.46,.45,.94) forwards`;
            c.style.animationDelay = (idx * 0.1) + 's';
          }, 10);
        } else {
          c.style.display = 'none';
        }
      });
    });
  });
}

/* --------------------------------------------------
   Enhanced hero stats counter
   -------------------------------------------------- */
function animateHeroStats() {
  const heroSection = document.querySelector('.skills-hero');
  if (!heroSection) return;

  const observer = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;

    document.querySelectorAll('.stat-value').forEach((el, idx) => {
      const text = el.textContent;
      const isPercent = text.includes('%');
      const isPlus = text.includes('+');
      let numText = text.replace('%', '').replace('+', '').trim();
      const num = parseInt(numText, 10);

      let current = 0;
      const increment = Math.ceil(num / 30);
      const timer = setInterval(() => {
        current += increment;
        if (current >= num) {
          current = num;
          clearInterval(timer);
          el.textContent = current + (isPlus ? '+' : '') + (isPercent ? '%' : '');
        } else {
          el.textContent = current + (isPlus ? '+' : '') + (isPercent ? '%' : '');
        }
      }, 30);
    });

    observer.unobserve(heroSection);
  }, { threshold: 0.3 });

  observer.observe(heroSection);
}

/* --------------------------------------------------
   Smooth scroll reveal for skill details
   -------------------------------------------------- */
function initSkillDetailsReveal() {
  const skillsDetail = document.querySelector('.skills-detail');
  const certifications = document.querySelector('.certifications');
  const timeline = document.querySelector('.timeline');
  const softSkills = document.querySelector('.soft-skills-grid');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  [skillsDetail, certifications, timeline, softSkills].forEach(el => {
    if (el) revealObserver.observe(el);
  });
}

/* --------------------------------------------------
   Hover ripple effect for cards
   -------------------------------------------------- */
function initCardRipples() {
  document.querySelectorAll('.skill-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      let ripple = card.querySelector('.ripple');
      if (!ripple) {
        ripple = document.createElement('div');
        ripple.className = 'ripple';
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'radial-gradient(circle, rgba(26,188,156,0.4), rgba(26,188,156,0))';
        ripple.style.pointerEvents = 'none';
        ripple.style.width = '20px';
        ripple.style.height = '20px';
        ripple.style.left = (x - 10) + 'px';
        ripple.style.top = (y - 10) + 'px';
        card.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
      }
    });
  });
}


/* --------------------------------------------------
   Hero typed effect
   -------------------------------------------------- */
function initHeroTyped() {
  const el = document.querySelector('.hero-typed');
  if (!el) return;
  let phrases = [];
  try { phrases = JSON.parse(el.getAttribute('data-phrases')); } catch(e) { phrases = ['APIs','Applications Web','Solutions évolutives']; }
  let index = 0, charIndex = 0, deleting = false;

  function tick() {
    const current = phrases[index % phrases.length];
    if (!deleting) {
      el.textContent = current.slice(0, charIndex + 1);
      charIndex++;
      if (charIndex === current.length) {
        deleting = true;
        setTimeout(tick, 900);
        return;
      }
    } else {
      el.textContent = current.slice(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) {
        deleting = false;
        index++;
      }
    }
    setTimeout(tick, deleting ? 60 : 90);
  }
  tick();
}

document.addEventListener('DOMContentLoaded', () => {
  initHeroTyped();
  initSkillsAnimation();
  animateHeroStats();
  initSkillDetailsReveal();
  initCardRipples();
});

