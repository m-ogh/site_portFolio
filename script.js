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
  // Remplace "cv.pdf" par le vrai nom de ton fichier CV
  downloadCVBtn.addEventListener("click", function() {
    window.open("cv.pdf", "_blank");
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

// Gestion du formulaire de contact (amélioré)
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = contactForm.querySelector('[name="name"]').value.trim();
    const email = contactForm.querySelector('[name="email"]').value.trim();
    const subject = contactForm.querySelector('[name="subject"]') ? contactForm.querySelector('[name="subject"]').value.trim() : '';
    const message = contactForm.querySelector('[name="message"]').value.trim();
    const formMessage = document.getElementById('formMessage');
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    if (!formMessage || !submitBtn) return;

    // Validation simple
    if (!name || !email || !subject || !message) {
      formMessage.textContent = 'Veuillez remplir tous les champs requis.';
      formMessage.className = 'form-message error';
      formMessage.hidden = false;
      return;
    }

    // Indicateur d'envoi
    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Envoi…';
    submitBtn.classList.add('sending');

    try {
      // Simuler envoi réseau (remplacez par fetch vers votre API si disponible)
      await new Promise(res => setTimeout(res, 900));

      // Succès
      formMessage.textContent = 'Merci ! Votre message a bien été envoyé.';
      formMessage.className = 'form-message success';
      formMessage.hidden = false;
      contactForm.reset();
    } catch (err) {
      formMessage.textContent = 'Une erreur est survenue. Réessayez plus tard.';
      formMessage.className = 'form-message error';
      formMessage.hidden = false;
    } finally {
      submitBtn.disabled = false;
      submitBtn.classList.remove('sending');
      submitBtn.textContent = originalText;
      setTimeout(() => { formMessage.hidden = true; }, 5000);
    }
  });
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

function openProjectModal(id) {
  if (!projectModal) return;
  // minimal dataset - expand as needed
  const data = {
    '1': {
      title: 'Gestion de biens immobiliers',
      desc: 'Application Symfony avec tableau de bord, API REST, authentification et gestion des annonces. Travail réalisé en binôme, tests et déploiement local.',
      tech: 'Symfony · PHP · MySQL',
      media: 'images/projet1.png',
      link: 'https://github.com/tonprofil/projet-immobilier'
    },
    '2': {
      title: 'API RH',
      desc: 'API REST sécurisée pour la gestion des employés et congés. Documentation OpenAPI et tests automatisés.',
      tech: 'Node.js · Express · JWT',
      media: 'images/projet2.png',
      link: '#'
    },
    '3': {
      title: 'Script d\'automatisation',
      desc: 'Scripts PowerShell et Python pour automatiser sauvegardes et rapports. Scripts documentés et planifiés via tâches.',
      tech: 'PowerShell · Python',
      media: 'images/projet3.png',
      link: '#'
    },
    '4': {
      title: 'Site vitrine entreprise',
      desc: 'Site statique responsive avec optimisation SEO, bonnes pratiques d\'accessibilité et performance.',
      tech: 'HTML · CSS · JS',
      media: 'images/projet4.png',
      link: '#'
    }
  };

  const item = data[id];
  if (!item) return;

  const modalMedia = document.getElementById('modalMedia');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalTech = document.getElementById('modalTech');
  const modalLink = document.getElementById('modalLink');

  if (modalMedia) modalMedia.style.backgroundImage = `url('${item.media}')`;
  if (modalTitle) modalTitle.textContent = item.title;
  if (modalDesc) modalDesc.textContent = item.desc;
  if (modalTech) modalTech.innerHTML = 'Technos : <strong>' + item.tech + '</strong>';
  if (modalLink) modalLink.innerHTML = `<a href="${item.link}" target="_blank" rel="noopener">Voir la source</a>`;

  projectModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
  if (!projectModal) return;
  projectModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
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

